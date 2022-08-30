import { watch } from 'vue';
import { SearchProvider, SearchState } from '@appvise/search-manager';
import {
  TokenOperationsConnection,
  TokenOperation,
  TokenOperationEdge,
  useTokenOperationsSearchQuery,
  QueryTokenOperationsArgs,
} from '@koiner/sdk';

export class TokenOperationsSearchProvider
  implements
    SearchProvider<
      QueryTokenOperationsArgs,
      TokenOperation,
      TokenOperationEdge,
      TokenOperationsConnection
    >
{
  private loaded = false;
  public _state = SearchState.create<
    QueryTokenOperationsArgs,
    TokenOperation,
    TokenOperationEdge,
    TokenOperationsConnection
  >();

  public get state(): SearchState<
    QueryTokenOperationsArgs,
    TokenOperation,
    TokenOperationEdge,
    TokenOperationsConnection
  > {
    return this._state;
  }

  public search(
    request: QueryTokenOperationsArgs
  ): Promise<
    SearchState<
      QueryTokenOperationsArgs,
      TokenOperation,
      TokenOperationEdge,
      TokenOperationsConnection
    >
  > {
    this._state.request.value = request;

    return new Promise((resolve) => {
      if (!this.loaded) {
        const { data, fetching, error, isPaused } =
          useTokenOperationsSearchQuery({
            variables: this.state.request,
          });

        watch(data, (updatedData) => {
          this._state.connection.value =
            updatedData?.tokenOperations as TokenOperationsConnection;
        });

        this._state.error = error;
        this._state.fetching = fetching;
        this._state.isPaused = isPaused;

        this.loaded = true;

        resolve(this._state);
      }

      resolve(this._state);
    });
  }
}
