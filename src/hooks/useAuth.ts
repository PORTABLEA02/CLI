import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

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
        console.error('❌ Erreur lors de la récupération du profil:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId
        });
        
        // Si le profil n'existe pas, on peut essayer de le créer
        if (error.code === 'PGRST116') {
          console.warn('⚠️ Profil non trouvé pour l\'utilisateur:', userId);
          console.log('💡 Suggestion: Vérifiez que le profil a été créé lors de l\'inscription');
        }
        
        throw error;
      }

      if (!data) {
        console.warn('⚠️ Aucune donnée de profil retournée pour l\'utilisateur:', userId);
        throw new Error('Profil utilisateur introuvable');
      }

      console.log('✅ Profil récupéré avec succès:', {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_active: data.is_active
      });

      // Vérifier si le compte est actif
      if (!data.is_active) {
        console.warn('⚠️ Compte utilisateur désactivé:', data.email);
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
    console.log('🔄 Changement de session détecté:', newSession ? 'Session active' : 'Pas de session');
    
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      try {
        await fetchProfile(newSession.user.id);
      } catch (error) {
        console.error('❌ Impossible de récupérer le profil, déconnexion de l\'utilisateur');
        // En cas d'erreur de profil, on déconnecte l'utilisateur
        await supabase.auth.signOut();
        clearAuthState();
      }
    } else {
      clearAuthState();
    }
  }, [fetchProfile, clearAuthState]);

  // Initialisation de l'authentification
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initialisation de l\'authentification...');
        
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session initiale:', {
            message: error.message,
            status: error.status
          });
          throw error;
        }

        if (mounted) {
          console.log('📋 Session initiale:', session ? 'Utilisateur connecté' : 'Aucune session');
          await handleSessionChange(session);
          setInitialized(true);
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
        if (mounted) {
          clearAuthState();
          setInitialized(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔔 Événement d\'authentification:', event, session ? 'Session active' : 'Pas de session');
        
        try {
          switch (event) {
            case 'SIGNED_IN':
              console.log('✅ Utilisateur connecté');
              await handleSessionChange(session);
              break;
              
            case 'SIGNED_OUT':
              console.log('👋 Utilisateur déconnecté');
              await handleSessionChange(null);
              break;
              
            case 'TOKEN_REFRESHED':
              console.log('🔄 Token rafraîchi');
              await handleSessionChange(session);
              break;
              
            case 'USER_UPDATED':
              console.log('👤 Utilisateur mis à jour');
              await handleSessionChange(session);
              break;
              
            default:
              console.log('📝 Événement d\'authentification:', event);
              await handleSessionChange(session);
          }
        } catch (error) {
          console.error('❌ Erreur lors du traitement de l\'événement d\'authentification:', error);
          if (mounted) {
            clearAuthState();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionChange, clearAuthState]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error('❌ Erreur de connexion:', {
          message: error.message,
          status: error.status,
          email
        });

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

      console.log('✅ Connexion réussie pour:', email);
      console.log('📋 Données de connexion:', {
        userId: data.user?.id,
        email: data.user?.email,
        sessionId: data.session?.access_token ? 'Token présent' : 'Pas de token'
      });
      
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
      console.log('🚪 Tentative de déconnexion...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', {
          message: error.message,
          status: error.status
        });
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
      console.log('📝 Tentative d\'inscription pour:', email);
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
        console.error('❌ Erreur lors de l\'inscription:', {
          message: error.message,
          status: error.status,
          email
        });
        return { data, error };
      }

      if (data.user) {
        console.log('✅ Utilisateur créé, création du profil...');
        
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
          console.error('❌ Erreur lors de la création du profil:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            userId: data.user.id
          });
          
          // Supprimer l'utilisateur si la création du profil échoue
          await supabase.auth.admin.deleteUser(data.user.id);
          
          return { 
            data: null, 
            error: { 
              message: 'Erreur lors de la création du profil utilisateur' 
            } 
          };
        }

        console.log('✅ Profil créé avec succès pour:', email);
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

  return {
    user,
    profile,
    session,
    loading: loading || !initialized,
    initialized,
    signIn,
    signOut,
    signUp,
    refreshProfile,
    isSessionValid,
  };
}