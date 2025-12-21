import {
  View,
  Platform,
  Text,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {useAuthStore}  from "../../store/authStore.js";
import styles from "../../assets/styles/create.styles.js";
import COLORS from "../../constants/colors.js";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagebase64, setImageBase64] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const {token} = useAuthStore();
  const pickImage = async () => {
    // Ask for permission to access media library
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied!");
          return;
        }
      }

      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaType: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // lower quality for faster upload
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // covert to base64 if not provided
          const base64Response = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            { encoding: FileSystem.EncodingType.Base64 }
          );
          setImageBase64(base64Response);
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  
  const handleSubmit = async () => {
    if (!title || !caption || !imagebase64 || !rating) {
      Alert.alert("Please fill all the fields.");
      return;
    }
    try {
      setLoading(true);
      const uriPart = image.split(".");
      const fileType = uriPart[uriPart.length - 1];
      const imageDataUrl = `data:image/${fileType};base64,${imagebase64}`;

      //backend: req.headers["Authorization"]?.replace("Bearer ", "")
      const response = await fetch(`${API_URL}/api/books`,{
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // tell server who we are
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating,
          image: imageDataUrl,
        }),
      });

      const text = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", text.substring(0, 1000));

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON response (status ${response.status}): ${text.substring(0,200)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to submit recommendation (status ${response.status})`);
      }
      // Reset form
      setTitle("");
      setCaption("");
      setImage(null);
      setImageBase64("");
      setRating(0);
      Alert.alert("Recommendation submitted.");
      router.push("/");


    } catch (error) {
      console.log("Error in handleSubmit:", error);
      Alert.alert("Error submitting recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const renderRatingPicker = (rating, setRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={30}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Add Book Recommendation</Text>
          <Text style={styles.subtitle}>
            Share your favorite books with the community
          </Text>
        </View>

        {/* form  */}
        <View style={styles.form}>
          {/* Book Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Book Title</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="book-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter book title"
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Rating Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Rating</Text>
            {renderRatingPicker(rating, setRating)}
          </View>

          {/* Image Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Book Cover Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={80}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.placeholderText}>
                    Tap to select an image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write a brief caption or review"
              placeholderTextColor={COLORS.placeholderText}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={4}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Submit Recommendation</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
