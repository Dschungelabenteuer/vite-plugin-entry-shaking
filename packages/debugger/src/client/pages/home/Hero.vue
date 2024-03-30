<script setup lang="ts">
import viteLogo from '@assets/vite.svg?raw';
import { store } from '#store';
import Illustration from '@components/Illustration/Illustration.vue';
</script>

<template>
  <div class="hero">
    <div class="hero__illustration">
      <Illustration />
    </div>
    <div class="hero__title">
      <div class="hero__tagline">
        <div v-html="viteLogo" />
        <div>vite-plugin-entry-shaking</div>
      </div>
      <h1 class="hero__name">{{ store.name }} example</h1>
    </div>
  </div>
</template>

<style lang="scss">
.hero {
  --vite-logo-size: 24px;
  --name-margin: calc(var(--spacing-md) + var(--vite-logo-size));
  --ilustration-max-width: 420px;

  @include flex;

  width: 100%;
  max-width: 100vw;
  height: 100%;

  &__illustration {
    display: block;
    width: 100%;
    max-width: var(--ilustration-max-width);
  }

  &__title {
    transform: translateX(calc(-1 * var(--name-margin)));

    svg {
      width: var(--vite-logo-size);
      height: var(--vite-logo-size);
      margin-inline-end: 0.75rem;
      filter: grayscale(0.5);
    }
  }

  &__tagline {
    @include flex(normal, center);

    font-weight: 700;
    color: var(--tagline-color);
    text-transform: uppercase;
    letter-spacing: 0.12rem;
  }

  &__name {
    font-size: var(--font-size-2xl);
    color: var(--name-color);
    transform: translateX(var(--name-margin));
  }

  @container (max-width: #{$breakpoint-md}) {
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__illustration {
      width: 420px;
      max-width: 90vw;
    }

    &__title {
      text-align: center;
      transform: translateX(0);
    }

    &__tagline {
      justify-content: center;
    }

    &__name {
      transform: translateX(0);
    }
  }
}
</style>
