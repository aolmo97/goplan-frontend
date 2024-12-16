import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import StorageService from "../../services/storage";
import { User } from "../../types";
import { UI_CONFIG } from "../../config";
import { useProfile } from "../../context/ProfileContext";

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

// Definir interfaces para los estilos agrupados por tipo
interface ProfileStyles {
  // Contenedores principales
  containers: {
    container: ViewStyle;
    loadingContainer: ViewStyle;
    errorContainer: ViewStyle;
    header: ViewStyle;
    imageContainer: ViewStyle;
    statsContainer: ViewStyle;
    statItem: ViewStyle;
    tagsContainer: ViewStyle;
    section: ViewStyle;
    infoSection: ViewStyle;
  };
  // Elementos de imagen
  images: {
    profileImage: ImageStyle;
    changePhotoButton: ViewStyle;
    statDivider: ViewStyle;
  };
  // Elementos de texto
  texts: {
    errorText: TextStyle;
    retryButtonText: TextStyle;
    name: TextStyle;
    bio: TextStyle;
    statNumber: TextStyle;
    statLabel: TextStyle;
    sectionTitle: TextStyle;
    subsectionTitle: TextStyle;
    tagText: TextStyle;
    infoTitle: TextStyle;
    infoText: TextStyle;
  };
  // Botones
  buttons: {
    retryButton: ViewStyle;
    tag: ViewStyle;
    editButton: ViewStyle;
    settingsButton: ViewStyle;
    logoutButton: ViewStyle;
    editButtonText: TextStyle;
    settingsButtonText: TextStyle;
    logoutButtonText: TextStyle;
  };
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profileVersion } = useProfile();

  useEffect(() => {
    loadUserData();
  }, [profileVersion]);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      console.log("Datos del usuario:", userData);

      if (userData) {
        setUser(userData);
      } else {
        // Datos de ejemplo para desarrollo
        const defaultUser = {
          id: "1",
          name: "Usuario de Prueba",
          email: "usuario@ejemplo.com",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          bio: "¡Hola! Me encanta conocer gente nueva y participar en actividades interesantes.",
          interests: ["Deportes", "Música", "Viajes", "Fotografía"],
          availability: {
            weekdays: true,
            weekends: true,
            mornings: true,
            afternoons: true,
            evenings: true,
          },
          plansCreated: ["1", "2", "3"],
          plansJoined: ["4", "5", "6"],
        };
        await StorageService.setUserData(defaultUser);
        setUser(defaultUser);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleSettings = () => {
    router.push("/profile/settings");
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAuthData();
              router.replace("/auth/login");
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert(
                "Error",
                "No se pudo cerrar sesión. Inténtalo de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const renderAvailability = () => {
    if (!user?.availability) return null;
    console.log("Availability:", user.availability);
    
    const { days, timeRanges } = user.availability;

    if (!days?.length && !timeRanges?.length) return null;

    return (
      <View style={styles.containers.section}>
        <Text style={styles.texts.sectionTitle}>Disponibilidad</Text>
        {days?.length > 0 && (
          <View>
            <Text style={styles.texts.subsectionTitle}>Días</Text>
            <View style={styles.containers.tagsContainer}>
              {days.map((day, index) => (
                <View key={index} style={styles.buttons.tag}>
                  <Text style={styles.texts.tagText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {timeRanges?.length > 0 && (
          <View style={{ marginTop: SPACING.MEDIUM }}>
            <Text style={styles.texts.subsectionTitle}>Horarios</Text>
            <View style={styles.containers.tagsContainer}>
              {timeRanges.map((time, index) => (
                <View key={index} style={styles.buttons.tag}>
                  <Text style={styles.texts.tagText}>{time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.containers.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.containers.errorContainer}>
        <Text style={styles.texts.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity style={styles.buttons.retryButton} onPress={loadUserData}>
          <Text style={styles.texts.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.containers.container}>
      <View style={styles.containers.header}>
        <TouchableOpacity onPress={handleEditProfile}>
          <View style={styles.containers.imageContainer}>
            <Image
              source={{
                uri:
                  user.photos && user.photos.length > 0
                    ? user.photos[0]
                    : '',
              }}
              style={styles.images.profileImage}
            />
            <View style={styles.images.changePhotoButton}>
              <FontAwesome name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.texts.name}>{user.name}</Text>
        {user.bio && <Text style={styles.texts.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.containers.statsContainer}>
        <View style={styles.containers.statItem}>
          <Text style={styles.texts.statNumber}>{user.plansCreated?.length || 0}</Text>
          <Text style={styles.texts.statLabel}>Planes Creados</Text>
        </View>
        <View style={styles.images.statDivider} />
        <View style={styles.containers.statItem}>
          <Text style={styles.texts.statNumber}>{user.plansJoined?.length || 0}</Text>
          <Text style={styles.texts.statLabel}>Planes Unidos</Text>
        </View>
      </View>

      <View style={styles.containers.section}>
        <Text style={styles.texts.sectionTitle}>Intereses</Text>
        <View style={styles.containers.tagsContainer}>
          {user.interests?.map((interest, index) => (
            <View key={index} style={styles.buttons.tag}>
              <Text style={styles.texts.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      {renderAvailability()}

      <TouchableOpacity style={styles.buttons.editButton} onPress={handleEditProfile}>
        <FontAwesome name="edit" size={20} color="#fff" />
        <Text style={styles.buttons.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttons.settingsButton} onPress={handleSettings}>
        <FontAwesome name="cog" size={20} color="#666" />
        <Text style={styles.buttons.settingsButtonText}>Configuración</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttons.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color={COLORS.ERROR} />
        <Text style={styles.buttons.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Crear los estilos con tipos específicos
const styles = StyleSheet.create<ProfileStyles>({
  containers: {
    container: {
      flex: 1,
      backgroundColor: COLORS.BACKGROUND,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.BACKGROUND,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.BACKGROUND,
      padding: SPACING.LARGE,
    },
    header: {
      alignItems: "center",
      padding: SPACING.LARGE,
      paddingTop: 40,
    },
    imageContainer: {
      position: "relative",
      marginBottom: SPACING.MEDIUM,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: SPACING.LARGE,
      backgroundColor: COLORS.LIGHT_GRAY,
      marginVertical: SPACING.LARGE,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -SPACING.TINY,
    },
    section: {
      padding: SPACING.LARGE,
    },
    infoSection: {
      padding: SPACING.LARGE,
    },
  },
  images: {
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    changePhotoButton: {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.PRIMARY,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: COLORS.BACKGROUND,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: COLORS.GRAY,
    },
  },
  texts: {
    errorText: {
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      color: COLORS.ERROR,
      textAlign: "center",
      marginBottom: SPACING.MEDIUM,
    },
    retryButtonText: {
      color: COLORS.BACKGROUND,
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
    name: {
      fontSize: TYPOGRAPHY.SIZES.XLARGE,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      color: COLORS.TEXT,
      marginBottom: SPACING.TINY,
    },
    bio: {
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      color: COLORS.GRAY,
      textAlign: "center",
      paddingHorizontal: SPACING.LARGE,
    },
    statNumber: {
      fontSize: TYPOGRAPHY.SIZES.XLARGE,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      color: COLORS.PRIMARY,
    },
    statLabel: {
      fontSize: TYPOGRAPHY.SIZES.SMALL,
      color: COLORS.GRAY,
      marginTop: SPACING.TINY,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.SIZES.LARGE,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      color: COLORS.TEXT,
      marginBottom: SPACING.MEDIUM,
    },
    subsectionTitle: {
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      color: COLORS.TEXT,
      marginBottom: SPACING.SMALL,
    },
    tagText: {
      color: COLORS.BACKGROUND,
      fontSize: TYPOGRAPHY.SIZES.SMALL,
    },
    infoTitle: {
      fontSize: TYPOGRAPHY.SIZES.LARGE,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      color: COLORS.TEXT,
      marginBottom: SPACING.MEDIUM,
    },
    infoText: {
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      color: COLORS.TEXT,
    },
  },
  buttons: {
    retryButton: {
      backgroundColor: COLORS.PRIMARY,
      paddingHorizontal: SPACING.LARGE,
      paddingVertical: SPACING.MEDIUM,
      borderRadius: 25,
    },
    tag: {
      backgroundColor: COLORS.PRIMARY,
      paddingHorizontal: SPACING.MEDIUM,
      paddingVertical: SPACING.SMALL,
      borderRadius: 20,
      margin: SPACING.TINY,
    },
    editButton: {
      backgroundColor: COLORS.PRIMARY,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING.MEDIUM,
      marginHorizontal: SPACING.LARGE,
      borderRadius: 10,
      marginTop: SPACING.LARGE,
    },
    settingsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING.MEDIUM,
      marginHorizontal: SPACING.LARGE,
      borderRadius: 10,
      marginTop: SPACING.MEDIUM,
      backgroundColor: COLORS.LIGHT_GRAY,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING.MEDIUM,
      marginHorizontal: SPACING.LARGE,
      borderRadius: 10,
      marginTop: SPACING.MEDIUM,
      marginBottom: SPACING.LARGE,
      backgroundColor: COLORS.LIGHT_GRAY,
    },
    editButtonText: {
      color: COLORS.BACKGROUND,
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      marginLeft: SPACING.SMALL,
    },
    settingsButtonText: {
      color: COLORS.GRAY,
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      marginLeft: SPACING.SMALL,
    },
    logoutButtonText: {
      color: COLORS.ERROR,
      fontSize: TYPOGRAPHY.SIZES.MEDIUM,
      marginLeft: SPACING.SMALL,
    },
  },
});
