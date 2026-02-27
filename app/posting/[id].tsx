import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { COLORS, SIZES } from "../../constants";
import { supabase } from "../../lib/supabase";

function safeClubObj(clubs: any) {
  return Array.isArray(clubs) ? clubs?.[0] : clubs;
}

export default function PostingDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [posting, setPosting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const club = useMemo(() => safeClubObj(posting?.clubs), [posting]);

  async function fetchPosting() {
    if (!id) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("postings")
        .select(`
          id,
          title,
          category,
          description,
          deadline,
          apply_url,
          ig_post_url,
          created_at,
          clubs:club_id (
            id,
            name,
            category,
            ig_handle,
            logo_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPosting(data);
    } catch (e: any) {
      console.log("FETCH POSTING ERROR:", e);
      setErrorMsg(e?.message ?? "Failed to load posting.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPosting();
  }, [id]);

  const openUrl = async (url?: string) => {
    if (!url) return;
    const ok = await Linking.canOpenURL(url);
    if (!ok) return Alert.alert("Can't open link", url);
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          title: "Posting Details",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.lightWhite },
        }}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : errorMsg ? (
        <View style={{ padding: SIZES.medium, gap: 12 }}>
          <Text style={{ fontWeight: "800", fontSize: 16 }}>Couldn’t load this posting</Text>
          <Text style={{ color: "#667085" }}>{errorMsg}</Text>

          <TouchableOpacity
            onPress={fetchPosting}
            style={{
              marginTop: 8,
              backgroundColor: COLORS.primary,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
            <Text style={{ color: "#475467" }}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: SIZES.medium, gap: 12 }}>
          {/* Title */}
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#111827" }}>
            {posting?.title ?? "Untitled role"}
          </Text>

          {/* Meta */}
          <Text style={{ color: "#667085" }}>
            {club?.name ?? "UBC Club"}
            {club?.category ? ` • ${club.category}` : ""}
            {posting?.category ? ` • ${posting.category}` : ""}
            {posting?.deadline ? ` • Deadline: ${posting.deadline}` : ""}
          </Text>

          {/* Description */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#E6E8EC",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text style={{ fontWeight: "800", marginBottom: 8 }}>Description</Text>
            <Text style={{ color: "#344054", lineHeight: 20 }}>
              {posting?.description ?? "No description provided."}
            </Text>
          </View>

          {/* Links */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#E6E8EC",
              borderRadius: 14,
              padding: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Links</Text>

            <TouchableOpacity
              onPress={() => openUrl(posting?.apply_url)}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openUrl(posting?.ig_post_url)}
              style={{
                borderWidth: 1,
                borderColor: "#E6E8EC",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ color: "#111827", fontWeight: "800" }}>View Instagram Post</Text>
            </TouchableOpacity>
          </View>

          {/* Club info */}
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#E6E8EC",
              borderRadius: 14,
              padding: 14,
              gap: 6,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Club</Text>
            <Text style={{ color: "#111827", fontWeight: "800" }}>{club?.name ?? "UBC Club"}</Text>
            {club?.ig_handle ? <Text style={{ color: "#667085" }}>@{club.ig_handle}</Text> : null}
            {club?.category ? <Text style={{ color: "#667085" }}>{club.category}</Text> : null}
          </View>

          <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
            <Text style={{ color: "#475467" }}>Back</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}
