import { ref } from 'vue';

const currentVehicleId = ref<number | null>(null);

export function useCurrentVehicle() {
  const setCurrentVehicle = (id: number | null) => {
    currentVehicleId.value = id;
    if (id !== null) {
      localStorage.setItem('current-vehicle-id', id.toString());
    }
  };

  const getCurrentVehicle = () => {
    if (currentVehicleId.value === null) {
      const stored = localStorage.getItem('current-vehicle-id');
      if (stored) {
        currentVehicleId.value = parseInt(stored);
      }
    }
    return currentVehicleId.value;
  };

  return {
    currentVehicleId,
    setCurrentVehicle,
    getCurrentVehicle,
  };
}
