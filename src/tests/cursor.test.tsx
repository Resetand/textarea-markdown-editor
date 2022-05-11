import { Cursor, Line } from "../lib/Cursor.new";

const createTextArea = (content: string | undefined) => {
    const el = document.createElement("textarea");
    if (content) {
        el.value = content;
    }
    return el;
};

// TODO: add more tests
describe("Cursor API", () => {
    test("should return info about lines in the textarea", () => {
        const ctn = "some content on the first line\nand the second line\n\nand here\n";

        const textarea = createTextArea(ctn);
        const lines = new Cursor(textarea).lines;

        expect(lines).toEqual<Line[]>([
            {
                text: "some content on the first line",
                lineNumber: 1,
                startsAt: 0,
                endsAt: 30,
            },
            {
                text: "and the second line",
                lineNumber: 2,
                startsAt: 31,
                endsAt: 50,
            },
            {
                text: "",
                lineNumber: 3,
                startsAt: 51,
                endsAt: 51,
            },
            {
                text: "and here",
                lineNumber: 4,
                startsAt: 52,
                endsAt: 60,
            },
            {
                text: "",
                lineNumber: 5,
                startsAt: 61,
                endsAt: 61,
            },
        ]);
    });
});
