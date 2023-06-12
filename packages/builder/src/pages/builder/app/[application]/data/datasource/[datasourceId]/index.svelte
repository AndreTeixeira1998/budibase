<script>
  import { goto } from "@roxi/routify"
  import {
    Button,
    Heading,
    Body,
    Divider,
    Layout,
    notifications,
    Table,
    Modal,
  } from "@budibase/bbui"
  import { datasources, integrations, queries, tables } from "stores/backend"
  import IntegrationConfigForm from "components/backend/DatasourceNavigator/TableIntegrationMenu/IntegrationConfigForm.svelte"
  import ICONS from "components/backend/DatasourceNavigator/icons"
  import CapitaliseRenderer from "components/common/renderers/CapitaliseRenderer.svelte"
  import { IntegrationTypes } from "constants/backend"
  import { isEqual } from "lodash"
  import { cloneDeep } from "lodash/fp"
  import { API } from "api"
  import { DatasourceFeature } from "@budibase/types"
  import TablesPanel from './_components/TablesPanel.svelte'
  import RelationshipsPanel from './_components/RelationshipsPanel.svelte'
  import QueriesPanel from './_components/QueriesPanel.svelte'
  import RestHeadersPanel from './_components/rest/HeadersPanel.svelte'
  import RestAuthenticationPanel from './_components/rest/AuthenticationPanel.svelte'
  import RestVariablesPanel from './_components/rest/VariablesPanel.svelte'

  let selectedPanel = null
  let panelOptions = []
  $: integration = datasource && $integrations[datasource.source]

  $: datasource = $datasources.selected

  $: getOptions(datasource)

  const getOptions = (datasource) => {
    if (datasource.plus) {
      // Google Sheets' integration definition specifies `relationships: false` as it doesn't support relationships like other plus datasources
      panelOptions = $integrations[datasource.source].relationships === false ? ['tables', 'queries'] : ['tables', 'relationships', 'queries']
      selectedPanel = panelOptions.includes(selectedPanel) ? selectedPanel : 'tables'
    } else if (datasource.source === "REST") {
      panelOptions = ['queries', 'headers', 'authentication', 'variables']
      selectedPanel = panelOptions.includes(selectedPanel) ? selectedPanel : 'queries'
    } else {
      panelOptions = ['queries']
      selectedPanel = 'queries'
    }
  }
</script>

{#each panelOptions as panelOption}
  <button on:click={() => selectedPanel = panelOption}>{panelOption}</button>
{/each}

<p>the config box</p>

{#if selectedPanel === null}
  <Body>loading...</Body>
{:else if selectedPanel === 'tables'}
  <TablesPanel {datasource} />
{:else if selectedPanel === 'relationships'}
  <RelationshipsPanel {datasource} />
{:else if selectedPanel === 'queries'}
  <QueriesPanel {datasource} />
{:else if selectedPanel === 'headers'}
  <RestHeadersPanel datasourceId={datasource._id} />
{:else if selectedPanel === 'authentication'}
  <RestAuthenticationPanel datasourceId={datasource._id} />
{:else if selectedPanel === 'variables'}
  <RestVariablesPanel datasourceId={datasource._id} />
{:else}
  <Body>Something went wrong</Body>
{/if}



<style>
</style>
