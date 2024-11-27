import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UI_CONFIG } from '../../config';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;
const { width } = Dimensions.get('window');

export default function Welcome() {
  const handleSocialLogin = (provider: string) => {
    // Aquí implementaremos la lógica de autenticación social
    console.log(`Login with ${provider}`);
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <FontAwesome name="map-marker" size={width * 0.2} color="#fff" style={styles.logo} />
          <Text style={styles.title}>GoPlan</Text>
          <Text style={styles.subtitle}>
            Conecta, planifica y disfruta de nuevas experiencias
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin('google')}
          >
            <FontAwesome name="google" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => handleSocialLogin('facebook')}
          >
            <FontAwesome name="facebook" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Continuar con Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialLogin('apple')}
          >
            <FontAwesome name="apple" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Continuar con Apple</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.emailButtonText}>Iniciar sesión con email</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.terms}>
          Al continuar, aceptas nuestros{' '}
          <Text style={styles.termsLink}>Términos y Condiciones</Text> y{' '}
          <Text style={styles.termsLink}>Política de Privacidad</Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SPACING.LARGE,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: SPACING.MEDIUM,
  },
  title: {
    fontSize: TYPOGRAPHY.SIZES.XLARGE * 1.5,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: '#fff',
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: SPACING.MEDIUM,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    borderRadius: 25,
    marginBottom: SPACING.MEDIUM,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.MEDIUM,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.MEDIUM,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#fff',
    marginHorizontal: SPACING.MEDIUM,
    fontSize: TYPOGRAPHY.SIZES.SMALL,
  },
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    padding: SPACING.MEDIUM,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.SMALL,
  },
  registerText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
  },
  registerLink: {
    color: COLORS.PRIMARY,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.TINY,
  },
  terms: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: TYPOGRAPHY.SIZES.SMALL,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
