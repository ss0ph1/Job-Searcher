import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, SIZES } from "../constants";
import { usePostings } from "../hooks/usePostings";

const ROLE_CATEGORIES = [
  "All",
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

const CLUB_CATEGORIES = [
  "All",
  "Tech",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Community",
  "Arts/Media",
  "Student Gov",
];

// helper: handle clubs being object OR array
function getClubObj(row: any) {
  const c = row?.clubs;
  return Array.isArray(c) ? c?.[0] : c;
}

export default function PostingsPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    query: "",
    roleCategory: "All",
    clubCategory: "All",
  });

  const [clubPickerOpen, setClubPickerOpen] = useState(false);

  const { data, isLoading, error, refetch } = usePostings();

  const filtered = useMemo(() => {
    let rows = (data ?? []) as any[];

    const q = (filters.query ?? "").trim().toLowerCase();
    const role = filters.roleCategory;
    const club = filters.clubCategory;

    // Role category filter (posting.category)
    if (role !== "All") {
      rows = rows.filter((r) => String(r?.category ?? "") === role);
    }

    // Club category filter (clubs.category)
    if (club !== "All") {
      rows = rows.filter((r) => {
        const clubObj = getClubObj(r);
        return String(clubObj?.category ?? "") === club;
      });
    }

    // Search filter
    if (q) {
      rows = rows.filter((r) => {
        const clubObj = getClubObj(r);

        const title = String(r?.title ?? "").toLowerCase();
        const clubName = String(clubObj?.name ?? "").toLowerCase();
        const desc = String(r?.description ?? "").toLowerCase();

        return title.includes(q) || clubName.includes(q) || desc.includes(q);
      });
    }

    return rows;
  }, [data, filters]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          title: "All Postings",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.lightWhite },
        }}
      />

      {/* Filters */}
      <View style={{ padding: SIZES.medium, gap: 10 }}>
        {/* Search */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E6E8EC",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            placeholder="Search roles or clubs..."
            value={filters.query}
            onChangeText={(t) => setFilters((f) => ({ ...f, query: t }))}
            autoCapitalize="none"
            style={{ fontSize: 14 }}
          />
        </View>

        {/* Club dropdown */}
        <TouchableOpacity
          onPress={() => setClubPickerOpen((v) => !v)}
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E6E8EC",
            paddingHorizontal: 12,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Club: {filters.clubCategory}</Text>
          <Text style={{ color: "#667085" }}>{clubPickerOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {clubPickerOpen ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E6E8EC",
              overflow: "hidden",
            }}
          >
            {CLUB_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setFilters((f) => ({ ...f, clubCategory: c }));
                  setClubPickerOpen(false);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: c === filters.clubCategory ? "#F2F4F7" : "#fff",
                }}
              >
                <Text>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Role tabs */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ROLE_CATEGORIES.map((c) => {
            const active = filters.roleCategory === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setFilters((f) => ({ ...f, roleCategory: c }))}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? "#111827" : "#E6E8EC",
                  backgroundColor: active ? "#111827" : "#fff",
                }}
              >
                <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "700" }}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={{ padding: SIZES.medium, gap: 12 }}>
          <Text>Something went wrong: {String(error)}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: SIZES.medium, gap: 12 }}
          data={filtered}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: any) => {
            const clubObj = getClubObj(item);

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/posting/[id]",
                    params: { id: String(item.id) },
                  })
                }
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#E6E8EC",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800" }} numberOfLines={1}>
                  {item.title ?? "Untitled role"}
                </Text>

                <Text style={{ color: "#667085" }} numberOfLines={1}>
                  {clubObj?.name ?? "UBC Club"}
                  {clubObj?.category ? ` • ${clubObj.category}` : ""}
                  {item?.category ? ` • ${item.category}` : ""}
                  {item?.deadline ? ` • Deadline: ${item.deadline}` : ""}
                </Text>

                {item?.description ? (
                  <Text style={{ color: "#344054", marginTop: 6 }} numberOfLines={2}>
                    {String(item.description).replace(/\s+/g, " ").trim()}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ padding: SIZES.medium, color: "#667085" }}>
              No postings match your filters.
            </Text>
          }
        />
      )}
    </View>
  );
}
