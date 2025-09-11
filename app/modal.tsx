import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{
      presentation: 'modal',
      headerStyle: { backgroundColor: '#22c55e' },
      headerTintColor: 'white',
    }}>
      {/* Add your modal screens here */}
    </Stack>
  );
}