export const getColor = idx => {
  if (idx == null || idx === -1) {
    return null
  }
  return `hsla(${((idx + 1) * 222) % 360}, 90%, 75%, 0.3)`
}

export const getIconForField = field => {
  const type = field.schema.type
  if (type === "options") {
    return "ChevronDown"
  } else if (type === "datetime") {
    return "Date"
  }
  return "Text"
}