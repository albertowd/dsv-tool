<template>
  <div>
    <!-- Injects <link rel="manifest">, the apple-touch-icon and theme-color
         head tags that @vite-pwa/nuxt generates. Without this the manifest is
         emitted but never referenced, so the app is not installable. -->
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
