mod bindings {
    wit_bindgen::generate!({
        path: "src/rewrapper.wit",
    });
    use super::Rewrapper;
    export!(Rewrapper);
}

struct Rewrapper;

impl bindings::exports::vscode::rewrapper::types::Guest for Rewrapper {
    fn rewrap_lines(lines: Vec<(bool, String)>, diff_lines: u64, column_length: u8) -> Vec<String> {
        let spec_lines: Vec<specfmt::Line> = lines
            .iter()
            .map(|(should_format, contents)| specfmt::Line {
                should_format: *should_format,
                contents: contents.as_str(),
            })
            .collect();

        specfmt::rewrap_lines(spec_lines, diff_lines as usize, column_length)
    }

    fn parse_diff_line_numbers(diff: String, verbose: bool) -> Vec<u64> {
        specfmt::parse_diff_line_numbers(&diff, verbose)
            .into_iter()
            .map(|n| n as u64)
            .collect()
    }

    fn apply_diff(lines: Vec<(bool, String)>, diff_line_numbers: Vec<u64>, verbose: bool) -> Vec<(bool, String)> {
        let contents: Vec<String> = lines.iter().map(|(_, s)| s.clone()).collect();

        let mut spec_lines: Vec<specfmt::Line> = lines
            .iter()
            .map(|(should_format, contents)| specfmt::Line {
                should_format: *should_format,
                contents: contents.as_str(),
            })
            .collect();

        let diff_nums: Vec<usize> = diff_line_numbers
            .into_iter()
            .map(|n| n as usize)
            .collect();

        specfmt::apply_diff(&mut spec_lines, &diff_nums, verbose);

        spec_lines
            .into_iter()
            .zip(contents.into_iter())
            .map(|(line, contents)| (line.should_format, contents))
            .collect()
    }
}
