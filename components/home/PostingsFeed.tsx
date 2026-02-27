import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { Database } from "../../lib/data";
import NearbyJobCard from "../common/cards/allPostings/AllPostingsCard";

type PostingRow = Database["public"]["Tables"]["postings"]["Row"];
type ClubRow = Database["public"]["Tables"]["clubs"]["Row"];
type PostingWithClub = PostingRow & { clubs: ClubRow | null };

type Props = {
  postings: PostingWithClub[];
};

export default function PostingsFeed({ postings }: Props) {
  const router = useRouter();

  const sorted = useMemo(() => {
    return (postings ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b?.created_at ?? 0).getTime() -
          new Date(a?.created_at ?? 0).getTime()
      );
  }, [postings]);

  return (
    <View style={{ marginTop: 16, gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700" }}>All postings</Text>

        <TouchableOpacity onPress={() => router.push("/postings")}>
          <Text style={{ color: "#667085", fontWeight: "600" }}>Browse</Text>
        </TouchableOpacity>
      </View>

      {sorted.length === 0 ? (
        <Text style={{ color: "#667085" }}>No postings yet.</Text>
      ) : (
        sorted.map((posting) => (
          <NearbyJobCard
            job={posting}
            key={`posting-${posting.id}`}
            handleNavigate={() =>
              router.push({
                pathname: "/posting/[id]",
                params: { id: String(posting.id) },
              })
            }
          />
        ))
      )}
    </View>
  );
}