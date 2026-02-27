import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { search, SIZES } from "../../../constants";
import styles from "./welcome.style";

// Tabs = ROLE categories (what the position is)
const roleCategories = [
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

// Dropdown = CLUB categories (what the club is)
const clubCategories = [
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

const Welcome = ({ onChangeFilters }) => {
  const router = useRouter();

  const [roleCategory, setRoleCategory] = useState("All");
  const [clubCategory, setClubCategory] = useState("All");
  const [clubPickerOpen, setClubPickerOpen] = useState(false);

  const [query, setQuery] = useState("");

  const canApply = useMemo(() => {
    return query.trim().length > 0 || roleCategory !== "All" || clubCategory !== "All";
  }, [query, roleCategory, clubCategory]);

  const applyFilters = (next = {}) => {
    const nextQuery = ("query" in next ? next.query : query).trim();
    const nextRole = "roleCategory" in next ? next.roleCategory : roleCategory;
    const nextClub = "clubCategory" in next ? next.clubCategory : clubCategory;
  
    onChangeFilters?.({
      query: nextQuery,
      roleCategory: nextRole,
      clubCategory: nextClub,
    });
  };
  

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.userName}>Hello!</Text>
        <Text style={styles.welcomeMessage}>Find UBC club roles</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search roles (e.g., developer, designer)"
            returnKeyType="search"
            onSubmitEditing={() => applyFilters()}
          />
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={() => applyFilters()} disabled={!canApply}>
          <Image source={search} resizeMode="contain" style={styles.searchBtnImage} />
        </TouchableOpacity>
      </View>

      {/* CLUB dropdown filter */}
      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => setClubPickerOpen((v) => !v)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: "#E6E8EC",
            borderRadius: 12,
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Club: {clubCategory}</Text>
          <Text style={{ color: "#667085" }}>{clubPickerOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {clubPickerOpen ? (
          <View
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#E6E8EC",
              borderRadius: 12,
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            {clubCategories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setClubCategory(c);
                  setClubPickerOpen(false);
                  applyFilters({ clubCategory: c });
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
      </View>

      {/* ROLE tabs filter */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={roleCategories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tab(roleCategory, item)}
              onPress={() => {
                setRoleCategory(item);
                applyFilters({ roleCategory: item });
              }}
            >
              <Text style={styles.tabText(roleCategory, item)}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={{ columnGap: SIZES.small }}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Link to Post page */}
      <TouchableOpacity onPress={() => router.push("/post")} style={{ marginTop: 10 }}>
        <Text style={{ color: "#667085" }}>Are you a club? Post a role →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Welcome;
