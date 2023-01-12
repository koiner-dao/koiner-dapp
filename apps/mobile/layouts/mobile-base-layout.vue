<template>
  <q-layout view="hHh LpR lFf" class="layout--mobile">
    <router-view />

    <q-footer elevated>
      <mobile-main-navigation />
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import KoinerLogo from 'src/components/koiner-logo.vue';
import { useAccountStore } from 'stores/account';
import { useKoinosStore } from 'stores/koinos';
import { useKoinerStore } from 'stores/koiner';
import { useStatsStore } from 'stores/stats';
import { useBookmarkStore } from '@koiner/bookmarks';
import MobileMainNavigation from '../components/mobile-main-navigation.vue';
import MobileDrawerNavigation from '../components/mobile-drawer-navigation.vue';
import { useWindowSize } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',
  components: {
    MobileMainNavigation,
  },
  setup() {
    const accountStore = useAccountStore();
    const koinosStore = useKoinosStore();
    const koinerStore = useKoinerStore();
    const statsStore = useStatsStore();
    const bookmarkStore = useBookmarkStore();
    const { width } = useWindowSize();
    const router = useRouter();
    const route = useRoute();

    koinosStore.load();
    statsStore.load();
    accountStore.load(koinerStore.environment);
    bookmarkStore.load(koinerStore.environment);

    const redirect = () => {
      const desktopRedirects: { [key: string]: string } = {
        'mobile.ecosystem': 'ecosystem',
        'mobile.account': 'account.portfolio',
        'mobile.network': 'network',
      };

      if (route.name && desktopRedirects[route.name.toString()]) {
        router.push({ name: desktopRedirects[route.name.toString()] });
      } else {
        router.push({ name: 'home' });
      }
    };

    watch(
      bookmarkStore,
      () => {
        accountStore.syncAddressFilter(bookmarkStore.bookmarkKeys('addresses'));
      },
      { deep: true }
    );

    watch(
      width,
      () => {
        if (width.value >= 1024) {
          redirect();
        }
      },
      { deep: true }
    );

    onMounted(() => {
      if (width.value >= 1024) {
        redirect();
      }
    });

    return {
      drawer: ref(false),
      route,
    };
  },
});
</script>