export var WELL_KNOWN_COMMANDS = [
    "bold",
    "italic",
    "strike-through",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "unordered-list",
    "ordered-list",
    "next-line",
    "indent",
    "code-block",
    "code-inline",
    "code",
    "link",
    "link-paste",
    "block-quotes",
];
export var defaultMarkdownTextareaOptions = {
    useIndentListPrefixTabulation: true,
    useIndentTabulation: true,
    useLinkMarkupOnSelectionPasteUrl: true,
    unorderedListSyntax: "-",
    boldSyntax: "**",
    italicSyntax: "*",
};
export var isRefObject = function (ref) {
    return ref !== null && typeof ref === "object";
};
