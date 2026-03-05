"use client"

import Image from 'next/image'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GitHubIcon } from '@/components/Icons'
import { useHandleAuth } from '@/lib/handleAuth'
import AuthBg from '@/public/loginbg.jpg'
import Logo from '@/public/logo.png'

export default function SignInForm() {
  const { oauthLoading, error, handleOAuth } = useHandleAuth()
  const isLoading = !!oauthLoading

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      <Image
        src={AuthBg}
        alt="Authentication background"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/25 via-black/15 to-black/35" />

      <div className="m-4 space-y-6 rounded-2xl bg-white/20 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/75 shadow-sm ring-1 ring-black/5">
            <Image src={Logo} alt="Logo" width={28} height={28} />
          </div>
        </div>

        <Button
          type="button"
          className="h-12 w-full bg-white/70 hover:bg-blue-400/20"
          onClick={() => handleOAuth("github")}
          disabled={isLoading}
        >
          {oauthLoading === "github"
            ? <LoaderCircle className="animate-spin" />
            : <GitHubIcon />
          }
          Continue with GitHub
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          id="clerk-captcha"
          data-cl-theme="auto"
          data-cl-size="normal"
          data-cl-language="auto"
        />

        <p className="pt-1 text-center text-sm text-muted-foreground">
          BE THE PART OF THE <span>UNFINISHED</span>
        </p>
      </div>
    </div>
  )
}