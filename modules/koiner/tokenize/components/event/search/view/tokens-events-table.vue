<template>
  <div class="row no-wrap items-center">
    <div v-if="title" class="text-h6">{{ title }}</div>

    <q-space />

    <div class="search-filters">
      <q-btn
        @click="burn = !burn"
        :push="!burn"
        class="event-filter-button"
        :style="burn ? 'background: #f443361c' : ''"
      >
        <q-icon
          name="whatshot"
          color="red"
          :style="burn ? '' : 'opacity: 0.6'"
        />
        <q-tooltip class="bg-red" anchor="center right" self="center left"
          >Include tokens burned</q-tooltip
        >
      </q-btn>
      <q-btn
        @click="mint = !mint"
        :push="!mint"
        class="event-filter-button"
        :style="mint ? 'background: #64aeea1a' : ''"
      >
        <q-icon name="add" color="64aeea" :style="mint ? '' : 'opacity: 0.6'" />
        <q-tooltip
          style="background: #64aeea"
          anchor="center right"
          self="center left"
          >Include tokens minted</q-tooltip
        >
      </q-btn>
      <q-btn
        @click="transfer = !transfer"
        :push="!transfer"
        class="event-filter-button"
        :style="transfer ? 'background: #4caf5021' : ''"
      >
        <q-icon
          name="east"
          color="green"
          :style="transfer ? '' : 'opacity: 0.6'"
        />
        <q-tooltip class="bg-green" anchor="center right" self="center left"
          >Include tokens transferred</q-tooltip
        >
      </q-btn>
    </div>

    <q-separator vertical class="q-ml-md q-mr-lg" />

    <search-filters
      :request="request"
      search-info="Search by impacted addresses, contract id, block id or transaction id"
    />
  </div>

  <q-json-search
    :schema="schema"
    :uischema="uiSchema"
    :request="request"
    :data="{}"
    @on-scroll="onScroll"
    :scroll-position="position"
    :additional-renderers="renderers"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from 'vue';
import { useSearchStore } from 'stores/search';
import { KoinerRenderers } from '@koiner/renderers';
import QJsonSearch from '@appvise/q-json-forms/QJsonSearch.vue';
import SearchFilters from '@appvise/search-manager/search-filters.vue';
import schema from '../token-events-search.schema.json';
import mobileUiSchema from './token-events-table.mobile-ui-schema.json';
import desktopUiSchema from './token-events-table.ui-schema.json';

export default defineComponent({
  name: 'TokensEventsTable',
  components: { QJsonSearch, SearchFilters },
  props: {
    title: {
      required: false,
      type: String,
    },
    heights: {
      required: false,
      type: Array as PropType<Array<number>>,
    },
    addresses: {
      required: false,
      type: Array as PropType<Array<string>>,
    },
    contractIds: {
      required: false,
      type: Array as PropType<Array<string>>,
    },
    parentId: {
      required: false,
      type: String,
    },
    parentType: {
      required: false,
      type: String,
    },
    burnFilter: {
      required: false,
      type: Boolean,
      default: true,
    },
    mintFilter: {
      required: false,
      type: Boolean,
      default: true,
    },
    transferFilter: {
      required: false,
      type: Boolean,
      default: true,
    },
    mobile: {
      required: false,
      type: Boolean,
      default: false,
    },
    live: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const searchStore = useSearchStore();

    const burn: Ref<boolean> = ref(props.burnFilter);
    const mint: Ref<boolean> = ref(props.mintFilter);
    const transfer: Ref<boolean> = ref(props.transferFilter);
    let heightsFilter: any;
    let addressFilter: any;
    let contractsFilter: any;

    const uiSchema = ref(props.mobile ? mobileUiSchema : desktopUiSchema);

    if (props.live) {
      // Use on chain search provider
      uiSchema.value.elements[0].options.search.provider = 'onChainTokenEvents';
    }

    const nameFilters: Ref<
      Array<{
        name: { equals: string };
      }>
    > = ref([]);

    const updateNameFilter = (filterName: string, active: boolean) => {
      if (active) {
        nameFilters.value.push({
          name: { equals: filterName },
        });
      } else {
        nameFilters.value = nameFilters.value.filter(
          (nameFilter) => nameFilter.name.equals !== filterName
        );
      }
    };

    const updateFilters = () => {
      if (!searchStore.tokenEvents.request.filter) {
        searchStore.tokenEvents.request.filter = {};
      }

      searchStore.tokenEvents.request.filter = { AND: [] };

      if (props.heights && props.heights.length > 0) {
        heightsFilter = props.heights.map((height) => {
          return {
            blockHeight: { equals: height },
          };
        });
      }

      if (props.addresses && props.addresses.length > 0) {
        addressFilter = props.addresses.map((address) => {
          return {
            OR: [{ from: { equals: address } }, { to: { equals: address } }],
          };
        });
      }

      if (props.contractIds && props.contractIds.length > 0) {
        contractsFilter = props.contractIds.map((contractId) => {
          return {
            contractId: { equals: contractId },
          };
        });
      }

      // Ignore when none or all are selected
      if (nameFilters.value.length === 1 || nameFilters.value.length === 2) {
        searchStore.tokenEvents.request.filter.AND!.push({
          OR: [...nameFilters.value],
        });
      }

      if (heightsFilter) {
        searchStore.tokenEvents.request.filter.AND!.push({
          OR: heightsFilter,
        });
      }

      if (addressFilter) {
        searchStore.tokenEvents.request.filter.AND!.push({
          OR: addressFilter,
        });
      }

      if (contractsFilter) {
        searchStore.tokenEvents.request.filter.AND!.push({
          OR: contractsFilter,
        });
      }

      if (props.parentId && props.parentType) {
        searchStore.tokenEvents.request.filter.AND!.push({
          parentId: { equals: props.parentId },
          parentType: { equals: props.parentType },
        });
      }
    };

    watch(burn, (newValue) => {
      updateNameFilter('burn', newValue);
    });

    watch(mint, (newValue) => {
      updateNameFilter('mint', newValue);
    });

    watch(transfer, (newValue) => {
      updateNameFilter('transfer', newValue);
    });

    watch(
      nameFilters,
      () => {
        updateFilters();
      },
      { deep: true }
    );

    // Update filters when addresses change
    watch(
      props,
      () => {
        updateFilters();
      },
      { deep: true }
    );

    onMounted(() => {
      updateNameFilter('burn', burn.value);
      updateNameFilter('mint', mint.value);
      updateNameFilter('transfer', transfer.value);

      updateFilters();
    });

    const onScroll = (newScrollPosition: number) => {
      searchStore.tokenEvents.position = newScrollPosition;
    };

    return {
      transfer,
      mint,
      burn,
      onScroll,
      schema,
      uiSchema: uiSchema.value,
      request: searchStore.tokenEvents.request,
      position: searchStore.tokenEvents.position,
      renderers: KoinerRenderers,
      nameFilters,
    };
  },
});
</script>
