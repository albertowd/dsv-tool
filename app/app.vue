<template>
  <div>
    <!-- Emits the manifest link, apple-touch-icon and theme-color head tags
         that @vite-pwa/nuxt generates. Without this the manifest file is built
         but never referenced, so the app is not installable. -->
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
