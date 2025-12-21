import { View, Image, Text } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import {formatMemberSince} from "../utils/formatDate";

export default function ProfileHeader() {
  const { user , logout} = useAuthStore();
  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user?.userProfile?.replace('/svg?', '/png?') }} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <Text style={styles.username} onPress={logout}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>Joined {formatMemberSince(user?.createdAt)}</Text>
      </View>
    </View>
  );
}
