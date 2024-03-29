<template>
  <q-table
    v-if="searchView.visible"
    ref="tableView"
    :class="`pa-0 ${styles.tableView.root} ${appliedOptions.class ?? ''} ${
      appliedOptions.rowHeights ?? 'regular-rows'
    }`"
    :rows-per-page-options="[0]"
    :row-key="rowKeyName"
    :rows="rows"
    :columns="columns"
    :loading="fetching"
    virtual-scroll
    flat
    :style="fullHeightCss"
    @virtual-scroll="onScroll"
    @request="onRequest"
    :pagination-label="
      (firstRowIndex, endRowIndex, totalRowsNumber) =>
        `${totalRowsNumber} items`
    "
  >
    <template
      v-for="(column, index) in columns"
      :key="`${searchView.path}-${index}`"
      #[`body-cell-${column.name}`]="props"
    >
      <q-td :props="props">
        <slot :name="[`${column.name}`]" :props="props" :result="props.row">
          <dispatch-renderer
            :schema="searchView.schema"
            :uischema="searchView.uischema.elements[column.elementIndex]"
            :path="searchView.path"
            :enabled="searchView.enabled"
            :renderers="searchView.renderers"
            :cells="searchView.cells"
            :result="props.row"
            :index="props.row.rowIndex"
          />
        </slot>
      </q-td>
    </template>
  </q-table>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { DispatchRenderer, rendererProps, RendererProps } from '@jsonforms/vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref, unref } from 'vue';
import { SearchRequestType, useSearchManager } from '@appvise/search-manager';
import { ControlElement } from '@jsonforms/core';
import { dom } from 'quasar';
import offset = dom.offset;
import {
  SearchViewElement,
  useJsonFormsSearchView,
  useQuasarSearchView,
} from '../index';
import {
  SearchOptions,
  SearchOptionsDefaults,
  UISchemaSearchOptions,
} from '@appvise/jsonforms-search-manager';
import { useWindowScroll, useWindowSize } from '@vueuse/core';

export default defineComponent({
  name: 'TableViewRenderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<SearchViewElement>(),
  },
  setup(props: RendererProps<SearchViewElement>) {
    const quasarSearchView = useQuasarSearchView(useJsonFormsSearchView(props));
    // TODO: Fix123
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const childElements = unref(quasarSearchView.searchView).uischema.elements;
    const columns: {
      elementIndex: number;
      name: string;
      label: string;
      field: string;
      visible: boolean;
      screenSize?: string;
    }[] = childElements.map((childElement: ControlElement, index: number) => {
      // TODO: Integrate uischema options
      return {
        elementIndex: index,
        name: childElement.scope.replace('#/properties/', ''),
        label: childElement.label,
        field: childElement.scope.replace('#/properties/', ''),
        align: 'left',
        visible: childElement.options?.visible ?? true,
        screenSize: childElement.options?.screenSize,
      };
    });

    const { width } = useWindowSize();
    const { y } = useWindowScroll();

    const uischema = unref(quasarSearchView.searchView).uischema;

    if (!uischema?.options?.search?.provider) {
      throw new Error('No search provider defined');
    }

    const searchOptions: SearchOptions = Object.assign(
      SearchOptionsDefaults,
      uischema.options.search as UISchemaSearchOptions
    );
    const searchManager = useSearchManager(searchOptions.provider);

    const request: SearchRequestType = quasarSearchView.request ?? {
      first: searchOptions.itemsPerPage,
    };

    const rowKeyName = 'id'; // TODO: Integrate uischema options
    const tableView = ref();

    const onRequest = async () => {
      await searchManager.search(request);

      if (quasarSearchView.scrollPosition) {
        tableView.value.scrollTo(
          quasarSearchView.scrollPosition,
          'start-force'
        );
      }
    };

    const onScroll = (scroll: any) => {
      searchManager.saveScrollPosition(scroll.index);

      const lastIndex =
        searchManager.connection.value && searchManager.connection.value?.edges
          ? searchManager.connection.value.edges.length - 1
          : -1;

      // Load more for fixed tables with virtual scroll
      if (
        searchManager.connection.value &&
        searchManager.connection.value.pageInfo.hasNextPage &&
        scroll.to > lastIndex - searchOptions.loadMoreThreshold &&
        width.value >= 1024
      ) {
        searchManager.loadMore();
      }
    };

    watch(y, () => {
      // Load more when using unlimited height tables + window scroll
      if (
        searchManager.connection.value &&
        searchManager.connection.value.pageInfo.hasNextPage &&
        width.value < 1024 &&
        y.value >
          window.document.body.clientHeight -
            searchOptions.loadMoreThreshold * 50 -
            window.innerHeight
      ) {
        searchManager.loadMore();
      }
    });

    onMounted(() => {
      // Get 1st page from server ()
      onRequest();
    });

    // Show table in full view height - offset from top - provided margin
    const fullHeight = ref(false);
    const fullHeightMargin = ref(0);

    if (uischema?.options?.fullHeight) {
      fullHeight.value = uischema.options.fullHeight;
    }

    if (uischema?.options?.fullHeightMargin) {
      fullHeightMargin.value = uischema.options.fullHeightMargin;
    }

    // Used for calculation height when using vh
    const tableOffsetTop = ref(0);

    watch(tableView, (newValue) => {
      if (newValue != null) {
        tableOffsetTop.value =
          offset(newValue.$el).top + fullHeightMargin.value;
      }
    });

    watch(width, () => {
      tableOffsetTop.value =
        offset(tableView.value.$el).top + fullHeightMargin.value;
    });

    watch(
      () => request.filter,
      async () => {
        await searchManager.search(request);
      },
      {
        deep: true,
      }
    );

    watch(
      () => request.sort,
      async () => {
        await searchManager.search(request);
      },
      {
        deep: true,
      }
    );

    const { t } = useI18n();

    watch(
      searchManager.connection,
      (newValue) => {
        quasarSearchView.onChange(newValue);
      },
      { deep: true }
    );

    return {
      // Search
      connection: searchManager.connection,
      fetching: searchManager.fetching,

      // Table
      tableView,
      columns: computed(() => {
        return columns.filter((column) => {
          return (
            (column.visible &&
              (!column.screenSize ||
                (column.screenSize === 'lt-smd' && width.value < 600) ||
                (column.screenSize === 'gt-smd' && width.value > 600) ||
                (column.screenSize === 'gt-sm' && width.value >= 1024) ||
                (column.screenSize === 'lt-md' && width.value < 1024) ||
                (column.screenSize === 'gt-md' && width.value >= 1440) ||
                (column.screenSize === 'lt-lg' && width.value < 1440))) ||
            (column.screenSize === 'gt-lg' && width.value >= 1920)
          );
        });
      }),
      rows: computed(() => {
        return searchManager.connection.value?.edges?.map((edge, index) => {
          return {
            rowIndex: index,
            ...edge,
          };
        });
      }),
      onScroll,
      onRequest,
      rowKeyName,
      searchOptions,
      fullHeightCss: computed(() => {
        if (fullHeight.value) {
          return `height: calc(100vh - ${tableOffsetTop.value}px);`;
        }

        return '';
      }),

      // View
      ...quasarSearchView,
      t,
    };
  },
});
</script>
