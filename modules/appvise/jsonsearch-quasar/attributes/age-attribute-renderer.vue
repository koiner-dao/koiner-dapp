<template>
  <attribute-wrapper
    v-bind="attributeWrapper"
    :styles="styles"
    :applied-options="appliedOptions"
  >
    <span :class="`${styles.attribute.age}`">
      {{ timeAgo(rawValue(result.node)) }} <span class="ago">ago</span>
      <q-tooltip>
        {{ date.formatDate(rawValue(result.node), 'YYYY-MM-DD HH:mm:ss.SSSZ') }}
      </q-tooltip>
    </span>
  </attribute-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { rendererProps, RendererProps } from '@jsonforms/vue';
import AttributeWrapper from './attribute-wrapper.vue';
import {
  AttributeElement,
  useJsonAttribute,
  useQuasarAttribute,
} from '@appvise/jsonsearch-quasar';
import { timeAgo } from '../util';
import { date } from 'quasar';

export default defineComponent({
  name: 'AgeAttributeRenderer',
  components: {
    AttributeWrapper,
  },
  props: {
    ...rendererProps<AttributeElement>(),

    result: {
      type: Object as PropType<any>,
      required: false,
      default: null,
    },
  },
  setup(props: RendererProps<AttributeElement>) {
    return {
      ...useQuasarAttribute(useJsonAttribute(props)),

      timeAgo,
      date,
    };
  },
});
</script>
