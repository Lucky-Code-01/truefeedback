"use client"


import verifyCodeSchema from '@/schema/isverifyCode'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import axios, { AxiosError } from "axios"
import { apiResponse } from "@/types/apitypeResponse";
import { useParams, useRouter } from 'next/navigation'
import { toast } from "sonner";


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
import { useState } from 'react'

function page() {

  const form = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: ""
    }
  });

  const router = useRouter();
  const params = useParams();
  const [loading,setLoading] = useState(false);

  async function OnSubmit(data: z.infer<typeof verifyCodeSchema>){
    setLoading(true);
    try{
      const response = await axios.post('/api/verify-email',{
        username : params.username,
        verifyCode : data.code
      });
      
      toast.success(response.data.message);
      router.replace('/sign-in');

    }
    catch(error){
      const axiosError = error as AxiosError<apiResponse>
      toast.error(axiosError.response?.data.message ?? "An error occurred. Please try again.");
    }

    finally{
      setLoading(false);
    }
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>

        {/* here form start */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(OnSubmit)} className='flex flex-col gap-6'>
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>{
              loading? <>
                <Loader2 className='mr-4 h-4 w-4 animate-spin'/> Please wait
              </> : "Verify"
              
              }</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default page
