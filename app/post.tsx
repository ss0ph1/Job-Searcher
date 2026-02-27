import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, SIZES } from "../constants";
import { supabase } from "../lib/supabase";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#E6E8EC",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: "#fff",
  fontSize: 14,
};

const dropdownBoxStyle = {
  borderWidth: 1,
  borderColor: "#E6E8EC",
  borderRadius: 12,
  backgroundColor: "#fff",
  overflow: "hidden" as const,
};

const CLUB_CATEGORIES = [
  "Tech",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Community",
  "Arts/Media",
  "Student Gov",
];

const ROLE_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Product",
  "Operations",
  "Finance",
  "Research",
  "Events",
  "Content",
];

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PostRole() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Club fields
  const [clubName, setClubName] = useState("");
  const [clubIgHandle, setClubIgHandle] = useState("");
  const [clubLogoUrl, setClubLogoUrl] = useState("");
  const [clubCategory, setClubCategory] = useState(CLUB_CATEGORIES[0]);
  const [clubPickerOpen, setClubPickerOpen] = useState(false);

  // Role fields
  const [title, setTitle] = useState("");
  const [roleCategory, setRoleCategory] = useState(ROLE_CATEGORIES[0]);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const [deadline, setDeadline] = useState(""); // YYYY-MM-DD


  const [applyUrl, setApplyUrl] = useState("");
  const [igPostUrl, setIgPostUrl] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(() => {
    return (
      clubName.trim().length >= 2 &&
      title.trim().length >= 3 &&
      description.trim().length >= 20 &&
      applyUrl.trim().length > 0 &&
      igPostUrl.trim().length > 0 &&
      deadline.trim().length > 0
    );
  }, [clubName, title, description, applyUrl, igPostUrl, deadline]);

  async function upsertClub() {
    const name = clubName.trim();

    const { data: existing, error: existingErr } = await supabase
      .from("clubs")
      .select("id")
      .ilike("name", name)
      .limit(1);
      
    if (existingErr) throw existingErr;
    

    if (existing && existing.length > 0) {
      // Optional: update category/handle/logo if you want, but MVP can skip
      return existing[0].id as string;
    }



    const { data: created, error: createErr } = await supabase
      .from("clubs")
      .insert({
        name,
        category: clubCategory,
        ig_handle: clubIgHandle.trim() || null,
        logo_url: clubLogoUrl.trim() || null,
        verified: false,
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    return created.id as string;
  }

  async function submit() {
    console.log("SUBMIT CLICKED ✅");
    console.log("isSubmitting =", isSubmitting);
  
    // 1) 防重复提交
    if (isSubmitting) {
      console.log("STOP: isSubmitting is true");
      return;
    }
  
    // 2) 基础字段校验（每个失败都会打印原因）
    if (!clubName.trim()) {
      console.log("STOP: missing clubName");
      return Alert.alert("Missing club name", "Please enter the club name.");
    }
    if (!title.trim()) {
      console.log("STOP: missing title");
      return Alert.alert("Missing role title", "Please enter the role title.");
    }
    if (description.trim().length < 20) {
      console.log("STOP: description too short", description.trim().length);
      return Alert.alert("Description too short", "Please add at least ~20 characters.");
    }
    if (!deadline.trim()) {
      console.log("STOP: missing deadline");
      return Alert.alert("Missing deadline", "Please pick a deadline date.");
    }
  
    const apply = applyUrl.trim();
    const ig = igPostUrl.trim();
  
    console.log("applyUrl =", apply);
    console.log("igPostUrl =", ig);
  
    if (!isValidUrl(apply)) {
      console.log("STOP: invalid applyUrl");
      return Alert.alert("Invalid apply link", "Please paste a valid https:// link.");
    }
    if (!isValidUrl(ig)) {
      console.log("STOP: invalid igPostUrl");
      return Alert.alert("Invalid IG post URL", "Please paste a valid https:// Instagram post URL.");
    }
  
    console.log("PASS: validations ✅ entering try...");
  
    setIsSubmitting(true);
    try {
      console.log("STEP: upsertClub start");
      const clubId = await upsertClub();
      console.log("STEP: upsertClub done, clubId =", clubId);
  
      const payload = {
        club_id: clubId,
        title: title.trim(),
        category: roleCategory,
        description: description.trim(),
        deadline: deadline.trim(),
        apply_url: apply,
        ig_post_url: ig,
      };
  
      console.log("POSTING PAYLOAD:", payload);
  
      const { data: inserted, error } = await supabase
        .from("postings")
        .insert(payload)
        .select();
  
      console.log("INSERT RESULT:", { inserted, error });
  
      if (error) throw error;
  
      Alert.alert("Posted!", "Your role has been published.");
      router.replace("/");
    } catch (e: any) {
      console.log("POST ERROR FULL:", e);
      Alert.alert("Error", e?.message ?? JSON.stringify(e));
    } finally {
      setIsSubmitting(false);
    }
  }
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.lightWhite }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Post a Role",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.lightWhite },
        }}
      />

      <ScrollView contentContainerStyle={{ padding: SIZES.medium, gap: 14 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Post a UBC Club Role</Text>
        <Text style={{ color: "#667085", lineHeight: 18 }}>
          Paste the Instagram post + structured details so students can filter and apply easily.
        </Text>

        {/* Club section */}
        <View style={{ marginTop: 8, gap: 8 }}>
          <Text style={{ fontWeight: "600" }}>Club info</Text>

          <TextInput
            style={inputStyle}
            placeholder="Club name (e.g., UBC Launch Pad)"
            value={clubName}
            onChangeText={setClubName}
          />

          {/* Club category dropdown */}
          <TouchableOpacity
            onPress={() => setClubPickerOpen((v) => !v)}
            style={{
              ...inputStyle,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Category: {clubCategory}</Text>
            <Text style={{ color: "#667085" }}>{clubPickerOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {clubPickerOpen ? (
            <View style={dropdownBoxStyle}>
              {CLUB_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setClubCategory(c);
                    setClubPickerOpen(false);
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: c === clubCategory ? "#F2F4F7" : "#fff",
                  }}
                >
                  <Text>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <TextInput
            style={inputStyle}
            placeholder="Instagram handle (optional, e.g., ubclaunchpad)"
            value={clubIgHandle}
            onChangeText={setClubIgHandle}
            autoCapitalize="none"
          />

          <TextInput
            style={inputStyle}
            placeholder="Club logo URL (optional)"
            value={clubLogoUrl}
            onChangeText={setClubLogoUrl}
            autoCapitalize="none"
          />
        </View>

        {/* Role section */}
        <View style={{ marginTop: 8, gap: 8 }}>
          <Text style={{ fontWeight: "600" }}>Role details</Text>

          <TextInput
            style={inputStyle}
            placeholder="Role title (e.g., Frontend Developer)"
            value={title}
            onChangeText={setTitle}
          />

          {/* Role category dropdown */}
          <TouchableOpacity
            onPress={() => setRolePickerOpen((v) => !v)}
            style={{
              ...inputStyle,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Role: {roleCategory}</Text>
            <Text style={{ color: "#667085" }}>{rolePickerOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {rolePickerOpen ? (
            <View style={dropdownBoxStyle}>
              {ROLE_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setRoleCategory(c);
                    setRolePickerOpen(false);
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: c === roleCategory ? "#F2F4F7" : "#fff",
                  }}
                >
                  <Text>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Deadline */}
          {Platform.OS === "web" ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600" }}>Deadline</Text>

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #E6E8EC",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 14,
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </View>
          ) : (
            <TextInput
              style={inputStyle}
              placeholder="Deadline (YYYY-MM-DD)"
              value={deadline}
              onChangeText={setDeadline}
              autoCapitalize="none"
            />
          )}

          <TextInput
            style={inputStyle}
            placeholder="Apply link (https://...)"
            value={applyUrl}
            onChangeText={setApplyUrl}
            autoCapitalize="none"
          />

          <TextInput
            style={inputStyle}
            placeholder="Instagram post URL (https://www.instagram.com/p/...)"
            value={igPostUrl}
            onChangeText={setIgPostUrl}
            autoCapitalize="none"
          />

          <TextInput
            style={[inputStyle, { height: 140, textAlignVertical: "top" as any }]}
            placeholder="Description (responsibilities, requirements, time commitment)"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || isSubmitting}
          style={{
            marginTop: 10,
            backgroundColor: !canSubmit || isSubmitting ? "#C7CEDB" : COLORS.primary,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {isSubmitting ? "Posting..." : "Publish role"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
          <Text style={{ color: "#475467" }}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
