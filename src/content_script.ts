let ENABLED = true;
let REPLACE_TEXT = "POFMA";

const CORRECTION_NOTICE_MATCH = /(“|")?CORRECTION NOTICE:?\s*This.{1,50}?contains.{1,50}?false.{1,50}?statements?.*?correct facts/gi;
const CORRECTION_NOTICE_REPLACE = /(“|")?CORRECTION NOTICE:?\s*This.{1,50}?contains.{1,50}?false.{1,50}?statements?.*?correct facts.{1,100}\[FACTUALLY_LINK\]\s*\.?\s*("|”)?/gi;
const GOV_LINK = "www.gov.sg/";

const createPofmaTag = () => {
  const POFMA_TAG = document.createElement("button");

  POFMA_TAG.innerText = REPLACE_TEXT;
  POFMA_TAG.style.backgroundColor = "black";
  POFMA_TAG.style.borderRadius = "10px";
  POFMA_TAG.style.border = "1px solid #fff";
  POFMA_TAG.style.fontWeight = "bold";
  POFMA_TAG.style.color = "#fff";
  POFMA_TAG.style.fontFamily = "Arial";
  POFMA_TAG.style.padding = "5px 7px";
  POFMA_TAG.style.margin = "5px 0";
  POFMA_TAG.style.fontSize = "10pt";
  POFMA_TAG.style.display = "inline-block";
  POFMA_TAG.style.lineHeight = "10pt";
  POFMA_TAG.style.cursor = "pointer";
  POFMA_TAG.style.outline = "none";
  POFMA_TAG.setAttribute('title', 'Click to show POFMA Correction Notice')

  return POFMA_TAG;
};

const findStartingNode = (thisNode: Node, endNode: Node): Node | null => {
  const { parentNode, previousSibling, nodeType, textContent } = thisNode;

  if (!thisNode) return null;

  if (nodeType === Node.TEXT_NODE && textContent.match(/CORRECTION NOTICE/i)) {
    let range = document.createRange();
    range.setStartBefore(thisNode);
    range.setEndAfter(endNode);
    const match = CORRECTION_NOTICE_MATCH.exec(range.toString());
    if (match) {
      const offset = /CORRECTION NOTICE.*?$/i.exec(textContent);
      thisNode.parentNode.insertBefore(
        document.createTextNode(textContent.substring(0, offset.index)),
        thisNode
      );
      thisNode.textContent = thisNode.textContent.substring(offset.index);
      return thisNode;
    }
  }

  if (previousSibling) return findStartingNode(previousSibling, endNode);
  if (parentNode) return findStartingNode(parentNode, endNode);

  return null;
};

const main = () => {
  const linkNodes = document.querySelectorAll(
    'a[href*="gov.sg"][href*="factually"]:not([data-unpofma])'
  );
  handleLinkNodes(linkNodes);
};

const handleLinkNodes = (linkNodes: NodeListOf<Element>) => {
  if (!ENABLED)
    return
  
  linkNodes.forEach((linkNode) => {
    console.log("handlingLinkNode");
    const startingNode = findStartingNode(linkNode, linkNode);
    if (!startingNode) return;
    
    const tag = createPofmaTag();
    startingNode.parentElement.insertBefore(tag, startingNode);

    let range = document.createRange();
    range.setStartBefore(startingNode);
    range.setEndAfter(linkNode);

    const notice = range.cloneContents();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    selection.deleteFromDocument();
    selection.removeAllRanges();

    tag.addEventListener("click", () => {
      notice.querySelector('a[href*="gov.sg"][href*="factually"]').setAttribute('data-unpofma', '')
      tag.replaceWith(notice);
    });
  });
};

chrome.storage.sync.get(
  {
    enabled: ENABLED,
    replaceText: REPLACE_TEXT,
  },
  ({ enabled, replaceText }) => {
    ENABLED = enabled;
    REPLACE_TEXT = replaceText;

    main();

    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }
);

var observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes) {
      Object.values(mutation.addedNodes).forEach((node) => {
        if (node.parentElement) {
          const linkNodes = node.parentElement.querySelectorAll(
            'a[href*="gov.sg"][href*="factually"]:not([data-unpofma])'
          )
          handleLinkNodes(linkNodes)
        }
      });
    }
  });
});
