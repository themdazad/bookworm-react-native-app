import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import styles from "../../assets/styles/home.styles";
import COLORS from "../../constants/colors.js";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../utils/formatDate.js";
import Loader from "../../components/Loader.jsx";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Home() {
  const { logout, token } = useAuthStore();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/books?page=${pageNum}&limit=3`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch books");
      }

      // todo fix it later
      const uniqueBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(
              new Set([...books, ...data.books].map((b) => b._id))
            ).map((id) => [...books, ...data.books].find((b) => b._id === id));

      setBooks(uniqueBooks);
      // setBooks((prevBooks) => [...prevBooks, ...data.books]);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      if (refresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Auto-refresh when screen comes into focus (e.g., after creating a book)
  useFocusEffect(
    useCallback(() => {
      fetchBooks(1, true);
    }, [])
  );

  const loadMoreBooks = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  };
  const renderRatingStarts = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          source={i <= rating ? "star" : "star-outline"}
          size={16}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }) => {
    return (

        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: item.user?.userProfile?.replace('/svg?', '/png?') }}
                style={styles.avatar}
                contentFilter="cover"
              />
              <Text style={styles.username}>{item.user.username}</Text>
            </View>
          </View>

          <View style={styles.bookImageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.bookImage}
              contentFilter="cover"
            />
          </View>
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStarts(item.rating)}
            </View>
            <Text style={styles.bookCaption}>{item.caption}</Text>
            <Text style={styles.date}>
              Shared on {formatPublishDate(item.createdAt)}
            </Text>
          </View>
        </View>

    );
  };

  //Loader
  if (loading) return <Loader />;

  return (
    <View style={[styles.container, { padding: 16, flex: 1 }]}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Readify</Text>
            <Text style={styles.headerSubtitle}>
              {" "}
              Discover books shared by our community
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        refreshing={refreshing}
        onRefresh={() => fetchBooks(1, true)}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="book" size={60} color={COLORS.textPrimary} />
              <Text style={styles.headerTitle}>No books found.</Text>
              <Text style={styles.headerSubtitle}>
                Be the first to share a book!
              </Text>
            </View>
          )
        }
      ></FlatList>
    </View>
  );
}
