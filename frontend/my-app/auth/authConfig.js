import { Platform } from "react-native";

export const authConfig = {
  apiUrl:
    Platform.OS === "android"
      ? "http://10.0.2.2:8080/api"
      : "http://localhost:8080/api",
};
