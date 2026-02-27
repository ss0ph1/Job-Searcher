import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import "react-native-reanimated";

import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

import type { Database } from "../lib/data";

import { Welcome } from "../components";
import PostingsFeed from "../components/home/PostingsFeed";

import { COLORS, SIZES } from "../constants";

SplashScreen.preventAutoHideAsync();

type PostingRow = Database["public"]["Tables"]["postings"]["Row"];
type ClubRow = Database["public"]["Tables"]["clubs"]["Row"];
type PostingWithClub = PostingRow & { clubs: ClubRow };

export type Filters = {
  query: string;
  roleCategory: string;
  clubCategory: string;
};

const Home = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMBold: require("../assets/fonts/DMSans-Bold.ttf"),
    DMMedium: require("../assets/fonts/DMSans-Medium.ttf"),
    DMRegular: require("../assets/fonts/DMSans-Regular.ttf"),
  });

  const [filters, setFilters] = useState<Filters>({
    query: "",
    roleCategory: "All",
    clubCategory: "All",
  });

  const [postings, setPostings] = useState<PostingWithClub[]>([]);

  const fetchPostings = useCallback(async () => {
    const { data, error } = await supabase
      .from("postings")
      .select(`
        id, title, category, description, deadline, apply_url, ig_post_url, club_id, created_at,
        clubs:clubs!inner(id, name, category, logo_url, ig_handle, verified)
      `)
      .order("created_at", { ascending: false });
      
    console.log("FETCH postings:", { count: data?.length, error });

    if (error) return;

    setPostings((data ?? []) as unknown as PostingWithClub[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPostings();
    }, [fetchPostings])
  );

  const filteredPostings = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return postings.filter((p) => {
      const roleOk =
        filters.roleCategory === "All" ||
        (p.category ?? "") === filters.roleCategory;

      const clubOk =
        filters.clubCategory === "All" ||
        (p.clubs?.category ?? "") === filters.clubCategory;

      const queryOk =
        !q ||
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.clubs?.name ?? "").toLowerCase().includes(q);

      return roleOk && clubOk && queryOk;
    });
  }, [postings, filters]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.lightWhite }}
      onLayout={onLayoutRootView}
    >
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerTitle: "",
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium }}>
          <Welcome onChangeFilters={setFilters} />
          <PostingsFeed postings={filteredPostings} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
