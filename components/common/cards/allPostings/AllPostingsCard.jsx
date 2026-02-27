import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import styles from "./AllPostingsCard.style";

const AllPostingsCard = ({ job, handleNavigate }) => {
  // clubs might be object or array depending on your select()
  const clubObj = Array.isArray(job?.clubs) ? job.clubs?.[0] : job?.clubs;

  const clubName = clubObj?.name ?? "UBC Club";
  const clubCategory = clubObj?.category ? ` • ${clubObj.category}` : "";
  const roleCategory = job?.category ? ` • ${job.category}` : "";
  const deadline = job?.deadline ? ` • Deadline: ${job.deadline}` : "";

  const descriptionPreview = useMemo(() => {
    const raw = (job?.description ?? "").trim();
    if (!raw) return "";
    // keep it clean for a one-card preview
    return raw.replace(/\s+/g, " ");
  }, [job?.description]);

  return (
    <TouchableOpacity style={styles.container} onPress={handleNavigate}>
      <View style={styles.textContainer}>
        {/* Title */}
        <Text style={styles.jobName} numberOfLines={1}>
          {job?.title ?? "Untitled role"}
        </Text>

        {/* Meta line */}
        <Text style={styles.jobType} numberOfLines={1}>
          {clubName}
          {clubCategory}
          {roleCategory}
          {deadline}
        </Text>

        {/* Description preview */}
        {descriptionPreview ? (
          <Text style={styles.jobDesc} numberOfLines={2}>
            {descriptionPreview}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default AllPostingsCard;
