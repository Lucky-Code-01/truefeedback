"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import messageSchema from '@/schema/messageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { apiResponse } from '@/types/apitypeResponse';
import { Loader2, Sparkle } from 'lucide-react';

function page() {

    const form = useForm({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: ''
        }
    });

    const params = useParams();
    const username = params.username;

    const [messages, setMessages] = useState([
        "What’s a hobby you’ve recently started? ",
        " If you could have dinner with any historical figure, who would it be? ",
        "What’s a simple thing that makes you happy?"
    ]);

    const currentMessage = form.watch('content');
    const [isSuggestLoading, setisSuggestLoading] = useState(false);
    const [isLoading,setIsLoading] = useState(false);

    const fetchSuggestedMessages = async() => {
        try{
            setisSuggestLoading(true);
            const response = await axios.get('/api/suggest-message');
            setMessages(response.data.message);
        }
        catch(error){
            const axiosError = error as AxiosError<apiResponse>;
            toast.error(axiosError.response?.data.message ?? "Faild to generate messages");
        }
        finally{
            setisSuggestLoading(false);
        }
    };

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        try{
            setIsLoading(true);
            const response = await axios.post('/api/send-message',{
                content: data.content,
                username
            });

            toast.success(response.data.message);
            form.reset({...form.getValues(),content: ''});
            
            
        }   
        catch(error){
            const axiosError = error as AxiosError<apiResponse>
            toast.error(axiosError.response?.data.message || "Message not send");
        }
        finally{
            setIsLoading(false);
        }
    };

    const handleMessageClick = (msg: string)=>{
        form.setValue("content",msg);
    }

    return (
        <div className='container mx-auto my-8 p-6 bg-white rounded max-w-4xl'>
            <h1 className="text-4xl font-bold mb-6 text-center">Public Profile Link</h1>
            <Form {...form}>
                <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name='content'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className='space-y-1'>
                                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Write your anonymous message here"
                                        className="resize-none"
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='flex justify-center'>
                        {
                            isLoading ? (<Button disabled={isLoading}>
                                <Loader2 className="w-4 h-4 animate-spin"/> Please wait
                            </Button>)
                            : (<Button disabled={isLoading || !currentMessage}>Submit</Button>)
                        }
                    </div>
                </form>
            </Form>

            {/* message box here */}
            <div className="space-y-4 my-8">
                <div className="space-y-2">
                    <Button
                        onClick={fetchSuggestedMessages}
                        className="my-4"
                        disabled={isSuggestLoading}
                    >
                        Generate Message <Sparkle />
                    </Button>
                    <p>Click on any message below to select it.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">Messages</h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {
                        messages.map((msg, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="mb-2"
                                onClick={()=>handleMessageClick(msg)}
                            >
                                {msg}
                            </Button>
                        ))
                    }
                </CardContent>
            </Card>

            <Separator className="my-6" />
            <div className="text-center">
                <div className="mb-4">Get Your Message Board</div>
                <Link href={'/sign-up'}>
                    <Button>Create Your Account</Button>
                </Link>
            </div>

        </div>
    )
}

export default page
