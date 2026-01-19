
import { useMutation } from '@tanstack/react-query';
import { loginWithEmail } from './login';

export const useLogin = () => {
    return useMutation({
        mutationFn: loginWithEmail,
        onSuccess: (data) => {
            console.log('Login successful', data);
        },
        onError: (error) => {
            console.error('Login failed', error);
        }
    });
};
