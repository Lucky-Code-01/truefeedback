"use client"

import { toast } from "sonner";
import acceptmessageSchema from "@/schema/acceptMessage"
import axios, { AxiosError } from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {Message} from '@/model/User';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiResponse } from "@/types/apitypeResponse";
import MessageCard from "@/components/MessageCard";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";

function page() {

  // make the state 
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoad, setIsSwitchLoad] = useState(false);

  const form = useForm({
    resolver: zodResolver(acceptmessageSchema),
    defaultValues: {
      acceptMessage: false,
    },
  });

  const { data: session } = useSession();
  const user = session?.user as User;

  const { register, watch, setValue } = form;
  const acceptMessage = watch('acceptMessage');


  // methods here
  const handleSwitchMessage = async () => {
    try {
      setIsSwitchLoad(true);
      const response = await axios.post('/api/accept-message', {
        acceptFlag: !acceptMessage
      });
      setValue('acceptMessage', !acceptMessage);
      toast(response.data.message || "Accept Message Update");
    }
    catch (error) {
      const axiosError = error as AxiosError<apiResponse>
      toast(axiosError.response?.data.message ?? "Failed to fetch message settings");
    }
    finally {
      setIsSwitchLoad(false);
    }
  }

  const fetchUserMessages = useCallback(async (refresh: Boolean = false) => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/get-message');
      const data = response.data.message;
      setMessages(data || []);
      if (refresh) {
        toast("Fresh message was fetch");
      }

    }
    catch (error) {
      const axiosError = error as AxiosError<apiResponse>
      toast(axiosError.response?.data.message ?? "Failed to fetch message");
    }

    finally {
      setIsLoading(false);
    }

  }, [setValue]);

  const fetchAcceptenceMessage = useCallback(async () => {
    try {
      setIsSwitchLoad(true);
      const response = await axios.get('/api/accept-message');
      const data = response.data.isAcceptingMessages;
      setValue('acceptMessage', data)
    }
    catch (error) {
      const axiosError = error as AxiosError<apiResponse>
      toast.error(axiosError.response?.data.message ?? "Failed to fetch message accept status");
    }
    finally {
      setIsSwitchLoad(false);
    }
  }, [setIsLoading, setMessages]);


  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id.toString() !== messageId));
  };

  useEffect(() => {
    if (!session || !user) return;

    fetchUserMessages();
    fetchAcceptenceMessage();

  }, [session, setValue, fetchAcceptenceMessage, fetchUserMessages]);


  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const profileUrl = `${baseUrl}/u/${session?.user.username}`;

  const copyToClipboard = async() => {
    await navigator.clipboard.writeText(profileUrl);
    toast.error("Profile URL has been copied to clipboard.");
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center bg-gray-50 rounded">
          <input
            type="text"
            value={profileUrl}
            disabled
            className=" w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Switch
          {...register('acceptMessage')}
          checked={acceptMessage}
          onCheckedChange={handleSwitchMessage}
          disabled={isSwitchLoad}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchUserMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
            
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default page
