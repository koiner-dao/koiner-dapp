<template>
  <q-page v-if="address" class="row items-start">
    <q-card class="tabs-card" flat bordered style="max-width: 100%">
      <q-card-section class="q-pt-xs">
        <q-tabs v-model="tab" dense align="left" style="width: 100%">
          <q-tab
            class="text-overline"
            :ripple="false"
            label="Token Ops"
            name="token-operations"
          />
          <q-tab
            class="text-overline"
            :ripple="false"
            label="Tx"
            name="transactions"
          />
          <q-tab
            class="text-overline"
            :ripple="false"
            label="Contract Events"
            name="contract-events"
          />
          <q-tab
            class="text-overline"
            :ripple="false"
            label="Token Events"
            name="token-events"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="token-operations">
            <tokens-operations-table :addresses="[address.id]" />
          </q-tab-panel>
          <q-tab-panel name="transactions">
            <transactions-table :addresses="[address.id]" />
          </q-tab-panel>
          <q-tab-panel name="contract-events">
            <contract-events-table :addresses="[address.id]" />
          </q-tab-panel>
          <q-tab-panel name="token-events">
            <tokens-events-table :addresses="[address.id]" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref } from 'vue';
import TokensOperationsTable from '@koiner/tokenize/components/operation/search/view/tokens-operations-table.vue';
import TransactionsTable from '@koiner/chain/transaction/search/view/transactions-table.vue';
import ContractEventsTable from '@koiner/contracts/components/contract/search/view/contracts-events-table.vue';
import TokensEventsTable from '@koiner/tokenize/components/event/search/view/tokens-events-table.vue';
import { Address } from '@koiner/sdk';

export default defineComponent({
  name: 'AccountHistoryPage',
  components: {
    TokensEventsTable,
    ContractEventsTable,
    TransactionsTable,
    TokensOperationsTable,
  },
  props: {
    address: {
      required: true,
      type: Object as PropType<Address>,
    },
  },

  setup() {
    const tab: Ref<string> = ref('token-operations');
    const addressFilter: Ref<string[]> = ref([]);

    const updateFilter = (newFilter: string[]) => {
      addressFilter.value = newFilter;
    };

    return {
      tab,
      addressFilter,
      updateFilter,
    };
  },
});
</script>
