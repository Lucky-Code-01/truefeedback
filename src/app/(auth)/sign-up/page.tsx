"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"
import singupSchema from "@/schema/signupSchema";
import { useDebounceCallback } from 'usehooks-ts'
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useRouter } from "next/navigation";
import { apiResponse } from "@/types/apitypeResponse";

import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from "lucide-react";
import Link from "next/link";


function page() {
    const form = useForm({
        resolver: zodResolver(singupSchema),
        defaultValues: {
            username: '',
            password: '',
            email: ''
        }
    });

    //   create some states here
    const [username, setuserName] = useState('');
    const [usermessage, setuserMessage] = useState('');
    const [isSubmitting, setisSubmitting] = useState(false);
    const [ischeckingUser, setischeckingUser] = useState(false);
    const debounced = useDebounceCallback(setuserName, 500);
    const router = useRouter();

    // useEffect here
    useEffect(() => {
        async function checkUser() {
            if (!username) {
                return;
            }
            try {
                setischeckingUser(true);
                setuserMessage(''); // reset message

                const response = await axios.get(`/api/check-username?uniqueUser=${username}`);

                setuserMessage(response.data.message);
            }
            catch (error) {
                const axiosError = error as AxiosError<apiResponse>;
                console.log(axiosError.message);
                setuserMessage(
                    axiosError.response?.data?.message || "Error checking username"
                );
            }

            finally {
                setischeckingUser(false);
            }
        };

        checkUser();
    }, [username]);

    // here the function for form submit
    const onSubmit = async (data: z.infer<typeof singupSchema>) => {
        try {
            setisSubmitting(true);
            const response = await axios.post('/api/sign-up', data);
            toast.success(response.data.message);

            router.replace(`/verify/${username}`);
        }
        catch (error) {
            console.error('Error during sign-up:', error);
            const axiosError = error as AxiosError<apiResponse>;
            let errorMessage = axiosError.response?.data.message;
            toast.error(errorMessage);
        }
        finally {
            setisSubmitting(false);
        }
    };
    

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            debounced(e.target.value);
                                        }}
                                    />
                                    {ischeckingUser && <Loader2 className="animate-spin" />}
                                    {!ischeckingUser && usermessage && (
                                        <p className={`text-sm ${usermessage === 'User name is unique'
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                            }`}
                                        >
                                            {username.length > 0 ? usermessage : ""}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name="email" />
                                    <p className='text-gray-400 text-sm text-muted'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" {...field} name="password" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>

                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default page
