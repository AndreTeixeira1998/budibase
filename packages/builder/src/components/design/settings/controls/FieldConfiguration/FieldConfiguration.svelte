<script>
  import { Button, ActionButton, Drawer } from "@budibase/bbui"
  import { createEventDispatcher } from "svelte"
  import ColumnDrawer from "./ColumnDrawer.svelte"
  import { cloneDeep } from "lodash/fp"
  import {
    getDatasourceForProvider,
    getSchemaForDatasource,
  } from "builderStore/dataBinding"
  import { currentAsset } from "builderStore"

  export let componentInstance
  export let value = []

  const convertOldColumnFormat = oldColumns => {
    if (typeof oldColumns?.[0] === "string") {
      value = oldColumns.map(field => ({ name: field, displayName: field }))
    }
  }

  $: convertOldColumnFormat(value)

  const dispatch = createEventDispatcher()

  let drawer
  let boundValue

  $: datasource = getDatasourceForProvider($currentAsset, componentInstance)
  $: schema = getSchema($currentAsset, datasource)
  $: options = Object.keys(schema || {})
  $: sanitisedValue = getValidColumns(value, options)
  $: updateBoundValue(sanitisedValue)

  const getSchema = (asset, datasource) => {
    const schema = getSchemaForDatasource(asset, datasource).schema

    // Don't show ID and rev in tables
    if (schema) {
      delete schema._id
      delete schema._rev
    }

    return schema
  }

  const updateBoundValue = value => {
    boundValue = cloneDeep(value)
  }

  const getValidColumns = (columns, options) => {
    if (!Array.isArray(columns) || !columns.length) {
      return []
    }
    // We need to account for legacy configs which would just be an array
    // of strings
    if (typeof columns[0] === "string") {
      columns = columns.map(col => ({
        name: col,
        displayName: col,
      }))
    }
    return columns.filter(column => {
      return options.includes(column.name)
    })
  }

  const open = () => {
    updateBoundValue(sanitisedValue)
    drawer.show()
  }

  const save = () => {
    dispatch("change", getValidColumns(boundValue, options))
    drawer.hide()
  }
</script>

<ActionButton on:click={open}>Configure fields</ActionButton>
<Drawer bind:this={drawer} title="Form Fields">
  <svelte:fragment slot="description">
    Configure the fields in your form.
  </svelte:fragment>
  <Button cta slot="buttons" on:click={save}>Save</Button>
  <ColumnDrawer slot="body" bind:columns={boundValue} {options} {schema} />
</Drawer>
