import React, { createContext, useState, useEffect } from 'react';
import { Profile, getProfile, saveProfile } from '../db/storage';

export const ProfileContext = createContext<{
  profile: Profile;
  saveProfile: (profile: Profile) => Promise<void>;
}>({
  profile: {
    weeklyLimit: '',
  },
  saveProfile: async () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile>({
    weeklyLimit: '',
  });

  useEffect(() => {
    (async () => {
      const savedProfile = await getProfile();
      setProfile(savedProfile);
    })();
  }, []);

  const handleSaveProfile = async (newProfile: Profile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile: handleSaveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
