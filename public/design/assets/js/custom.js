function formatDate(date) {
  if (date) {
    var newDate = new Date(date).toISOString().split("T");
        return `${newDate[0]} ${newDate[1].replace(".000Z", "")}`;
  }
  return '';
}

