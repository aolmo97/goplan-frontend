import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProfileContextType {
  profileVersion: number;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profileVersion: 0,
  refreshProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileVersion, setProfileVersion] = useState(0);

  const refreshProfile = useCallback(() => {
    setProfileVersion(prev => prev + 1);
  }, []);

  return (
    <ProfileContext.Provider value={{ profileVersion, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
