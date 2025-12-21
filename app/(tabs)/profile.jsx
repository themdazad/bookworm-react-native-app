import {
  View,
  Alert,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import styles from "../../assets/styles/profile.styles";
import COLORS from "../../constants/colors.js";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { useAuthStore } from "../../store/authStore.js";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function Profile() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const router = useRouter();
  const [deletedBookId, setDeletedBookId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    // Fetch only logged-in user's recommendations
    try {
      const response = await fetch(`${API_URL}/api/books/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // tell server who we are
        },
      });
      const data = await response.json();
      setBooks(data.books);
      console.log("Fetched user data:", data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const confirmDeleteBook = (bookId) => {
    Alert.alert(
      "Delete Recommendation",
      "Are you sure you want to delete this recommendation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBook(bookId),
        },
      ]
    );
  };
  const deleteBook = async (bookId) => {
    try {
      setDeletedBookId(bookId);
      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // tell server who we are
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Book deleted:", data);
        setBooks(books.filter((book) => book._id !== bookId));
        Alert.alert("Recommendation deleted successfully .");

        // Refresh the book list after deletion
        fetchUserData();
      } else {
        console.error("Failed to delete book:", data.message);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setDeletedBookId(null);
    }
  };
  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton}>
        {deletedBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name="trash-bin-outline"
            size={20}
            color={COLORS.primary}
            onPress={() => {
              confirmDeleteBook(item._id);
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Simulate a 1 second delay for better UX
    await fetchUserData();
    setRefreshing(false);
  };

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No recommendations yet.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR RECOMMENDATIONS WILL APPEAR HERE */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations</Text>
        <Text style={styles.booksCount}>{books.length}</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[COLORS.primary]}
          tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#FFFFFF" />
            <Text style={styles.emptyText}>No recommendations yet.</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                router.push("/create");
              }}
            >
              <Text style={styles.addButtonText}>Add Recommendation</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
