function saveOptions() {
  const enabled = (document.getElementById("enabled") as HTMLInputElement)
    .checked;
  const replaceText = (document.getElementById(
    "replaceText"
  ) as HTMLInputElement).value;

  chrome.storage.sync.set(
    {
      enabled,
      replaceText,
    },
    () => {
      document.getElementById("status").innerText = "Saved";
      setTimeout(() => {
        document.getElementById("status").innerText = "";
      }, 1000);
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      enabled: true,
      replaceText: "POFMA",
    },
    ({ enabled, replaceText }) => {
      (document.getElementById(
        "enabled"
      ) as HTMLInputElement).checked = enabled;
      (document.getElementById(
        "replaceText"
      ) as HTMLInputElement).value = replaceText;
    }
  );
}

document.getElementById("save").addEventListener("click", saveOptions);

restoreOptions();
