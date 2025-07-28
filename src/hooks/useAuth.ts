import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Fonction pour nettoyer l'état lors de la déconnexion
  const clearAuthState = useCallback(() => {
    console.log('🧹 Nettoyage de l\'état d\'authentification');
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  // Fonction pour récupérer le profil utilisateur
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('👤 Récupération du profil pour l\'utilisateur:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();


      if (error) {
        console.error('❌ Erreur lors de la récupération du profil:', error);
        
        throw error;
      }

      if (!data) {
        throw new Error('Profil utilisateur introuvable');
      }

      console.log('✅ Profil récupéré avec succès:', data.full_name);

      // Vérifier si le compte est actif
      if (!data.is_active) {
        throw new Error('Votre compte a été désactivé. Contactez l\'administrateur.');
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la récupération du profil:', error);
      throw error;
    }
  }, []);

  // Fonction pour gérer les changements de session
  const handleSessionChange = useCallback(async (newSession: Session | null) => {
    console.log('🔄 Changement de session:', newSession ? 'Utilisateur connecté' : 'Pas de session');
    
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      try {
        setLoading(true);
        await fetchProfile(newSession.user.id);
      } catch (error) {
        console.error('❌ Impossible de récupérer le profil:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    } else {
      clearAuthState();
      setLoading(false);
    }
  }, [fetchProfile, clearAuthState]);

  // Fonction pour gérer la visibilité de la page
  const handleVisibilityChange = useCallback(() => {
    const isCurrentlyVisible = !document.hidden;
    setIsVisible(isCurrentlyVisible);
    
    if (isCurrentlyVisible && session) {
      console.log('👁️ Page redevenue visible, vérification de la session...');
      // Vérifier si la session est toujours valide
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      
      if (expiresAt <= now) {
        console.warn('⚠️ Session expirée détectée lors du retour sur la page');
        clearAuthState();
      } else {
        // Rafraîchir la session si elle expire bientôt (dans moins de 5 minutes)
        const timeUntilExpiry = expiresAt - now;
        if (timeUntilExpiry < 300) {
          console.log('🔄 Rafraîchissement préventif de la session...');
          supabase.auth.refreshSession();
        }
      }
    }
  }, [session, clearAuthState]);

  // Initialisation de l'authentification
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initialisation: Tentative de récupération de session...');
        setLoading(true);
       console.log('🚀 Initialisation: setloadin.')
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
         console.log('🚀 Initialisation: tttt.')
        if (error) {
          console.error('❌ Erreur lors de la récupération de session:', error.message);
          // Ajoutez plus de détails sur l'erreur si disponible
          console.error('Détails de l\'erreur getSession:', error);
          // Ne pas throw l'erreur, juste nettoyer l'état
          if (mounted) {
            clearAuthState();
            setInitialized(true);
            setLoading(false);
          }
          return;
        }

        if (session) {
          console.log('✅ Session récupérée avec succès:', session);
          console.log('Expires at:', new Date(session.expires_at * 1000).toLocaleString());
          console.log('Access Token (début):', session.access_token.substring(0, 10) + '...');
          console.log('Refresh Token (début):', session.refresh_token ? session.refresh_token.substring(0, 10) + '...' : 'N/A');
        } else {
          console.log('⚠️ Aucune session active trouvée par getSession().');
        }

        if (mounted) {
          await handleSessionChange(session);
          setInitialized(true);
        }
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        if (mounted) {
          clearAuthState();
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    const setupAuth = async () => {
      await initializeAuth();
      
      // Écouter les changements d'authentification seulement après l'initialisation
      if (mounted) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔔 Auth event:', event);
            
            try {
              await handleSessionChange(session);
            } catch (error) {
              console.error('❌ Erreur auth event:', error);
              if (mounted) {
                clearAuthState();
                setLoading(false);
              }
            }
          }
        );
        authSubscription = subscription;
      }
    };

    setupAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [handleSessionChange, clearAuthState]);

  // Écouter les changements de visibilité de la page
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Écouter les événements de focus/blur de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Fenêtre a retrouvé le focus');
      setIsVisible(true);
      if (session) {
        // Vérifier la validité de la session
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        
        if (expiresAt <= now) {
          console.warn('⚠️ Session expirée détectée lors du focus');
          clearAuthState();
        }
      }
    };

    const handleBlur = () => {
      console.log('😴 Fenêtre a perdu le focus');
      setIsVisible(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [session, clearAuthState]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Connexion:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error('❌ Erreur connexion:', error.message);

        // Messages d'erreur personnalisés
        let userMessage = 'Erreur de connexion';
        switch (error.message) {
          case 'Invalid login credentials':
            userMessage = 'Email ou mot de passe incorrect';
            break;
          case 'Email not confirmed':
            userMessage = 'Veuillez confirmer votre email avant de vous connecter';
            break;
          case 'Too many requests':
            userMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
            break;
          default:
            userMessage = error.message;
        }
        
        return { data, error: { ...error, message: userMessage } };
      }

      console.log('✅ Connexion réussie');
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la connexion:', error);
      return { 
        data: null, 
        error: { 
          message: 'Une erreur inattendue s\'est produite lors de la connexion' 
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Déconnexion...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion:', error.message);
        return { error };
      }

      console.log('✅ Déconnexion réussie');
      clearAuthState();
      
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion:', error);
      return { 
        error: { 
          message: 'Une erreur inattendue s\'est produite lors de la déconnexion' 
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      console.log('📝 Inscription:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });

      if (error) {
        console.error('❌ Erreur inscription:', error.message);
        return { data, error };
      }

      if (data.user) {
        console.log('✅ Création du profil...');
        
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              email: email.trim().toLowerCase(),
              full_name: fullName.trim(),
              role: role as any,
              is_active: true
            },
          ]);

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError.message);
          
          // Supprimer l'utilisateur si la création du profil échoue
          await supabase.auth.admin.deleteUser(data.user.id);
          
          return { 
            data: null, 
            error: { 
              message: 'Erreur lors de la création du profil utilisateur' 
            } 
          };
        }

        console.log('✅ Profil créé avec succès');
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'inscription:', error);
      return { 
        data: null, 
        error: { 
          message: 'Une erreur inattendue s\'est produite lors de l\'inscription' 
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      try {
        await fetchProfile(user.id);
      } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement du profil:', error);
      }
    }
  }, [user?.id, fetchProfile]);

  // Fonction pour vérifier si la session est valide
  const isSessionValid = useCallback(() => {
    if (!session) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Vérifier si la session expire dans moins de 5 minutes
    const isExpiringSoon = (expiresAt - now) < 300;
    
    if (isExpiringSoon) {
      console.warn('⚠️ Session expire bientôt, rafraîchissement recommandé');
    }
    
    return expiresAt > now;
  }, [session]);

  // Fonction pour forcer le rafraîchissement de la session
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Rafraîchissement manuel de la session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        clearAuthState();
        return false;
      }
      
      if (data.session) {
        console.log('✅ Session rafraîchie avec succès');
        await handleSessionChange(data.session);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur inattendue lors du rafraîchissement:', error);
      clearAuthState();
      return false;
    }
  }, [clearAuthState, handleSessionChange]);

  return {
    user,
    profile,
    session,
    loading: loading || !initialized,
    initialized,
    isVisible,
    signIn,
    signOut,
    signUp,
    refreshProfile,
    isSessionValid,
    refreshSession,
  };
}