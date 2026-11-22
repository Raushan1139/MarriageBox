import { useState, useCallback } from 'react';

export function usePersonalize() {
  const getFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      bride: params.get('bride') ? decodeURIComponent(params.get('bride')) : '',
      groom: params.get('groom') ? decodeURIComponent(params.get('groom')) : '',
    };
  };

  const initial = getFromURL();
  const [bride, setBride] = useState(initial.bride);
  const [groom, setGroom] = useState(initial.groom);
  const [shimmer, setShimmer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateURL = useCallback((b, g) => {
    const url = new URL(window.location.href);
    b ? url.searchParams.set('bride', b) : url.searchParams.delete('bride');
    g ? url.searchParams.set('groom', g) : url.searchParams.delete('groom');
    window.history.replaceState({}, '', url.toString());
  }, []);

  const setNames = useCallback(
    (b, g) => {
      setBride(b);
      setGroom(g);
      updateURL(b, g);
      if (b || g) {
        setShimmer(true);
        setTimeout(() => setShimmer(false), 4500);
      }
    },
    [updateURL]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const reset = useCallback(() => {
    setBride('');
    setGroom('');
    updateURL('', '');
  }, [updateURL]);

  return { bride, groom, shimmer, setNames, reset, isModalOpen, openModal, closeModal };
}
