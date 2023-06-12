<script>
  import {
    Divider,
    Heading,
    ActionButton,
    Badge,
    Body,
    Layout,
  } from "@budibase/bbui"
  import KeyValueBuilder from "components/integration/KeyValueBuilder.svelte"
  import RestAuthenticationBuilder from "./auth/RestAuthenticationBuilder.svelte"
  import ViewDynamicVariables from "./variables/ViewDynamicVariables.svelte"
  import {
    getRestBindings,
    getEnvironmentBindings,
    readableToRuntimeBinding,
    runtimeToReadableMap,
  } from "builderStore/dataBinding"
  import { cloneDeep } from "lodash/fp"
  import { licensing } from "stores/portal"

  export let datasource
  export let queries

  let addHeader

  let parsedHeaders = runtimeToReadableMap(
    getRestBindings(),
    cloneDeep(datasource?.config?.defaultHeaders)
  )

  const onDefaultHeaderUpdate = headers => {
    const flatHeaders = cloneDeep(headers).reduce((acc, entry) => {
      acc[entry.name] = readableToRuntimeBinding(getRestBindings(), entry.value)
      return acc
    }, {})

    datasource.config.defaultHeaders = flatHeaders
  }
</script>

<KeyValueBuilder
  bind:this={addHeader}
  bind:object={parsedHeaders}
  on:change={evt => onDefaultHeaderUpdate(evt.detail)}
  noAddButton
  bindings={getRestBindings()}
/>
<div>
  <ActionButton icon="Add" on:click={() => addHeader.addEntry()}>
    Add header
  </ActionButton>
</div>

<style>
  .section-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .badge {
    display: flex;
    gap: var(--spacing-m);
  }
</style>
