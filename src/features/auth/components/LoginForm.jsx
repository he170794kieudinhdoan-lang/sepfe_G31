
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLogin } from '../api/useLogin';
import { loginSchema } from './login.schema';

export const LoginForm = ({ onSuccess }) => {
    const { mutate, isPending } = useLogin();

    // 1. Setup Form with React Hook Form + Zod
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'user@example.com',
        },
    });

    // 2. Submit Handler
    const onSubmit = (data) => {
        // Data is already validated here
        mutate(data, {
            onSuccess: () => onSuccess(),
        });
    };

    return (
        <Card className="max-w-md mx-auto mt-20 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            placeholder="your@email.com"
                        />
                        {errors.email && (
                            <span className="text-xs text-destructive font-medium">{errors.email.message}</span>
                        )}
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full rounded-full shadow-lg">
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
