import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>HELLO</Text>
      <Link href="/(auth)">Go to Login</Link>
      <Link href="/(auth)/signup">Go to Signup</Link>
    </View>
  );
}
