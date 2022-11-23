# Build-Information Generator

Generates a build-info.json file describing the version of the code in a build.


## Input Params

- `output-name` - The file name to output. Defaults to `build-info.json`.
- `format` - The data format for the generated file. At present, only `json` is supported. (If specified, must be lowercase.)


## Usage

```yml
  steps:

    - name: Create build-info.json with default inputs.
      uses: nciocpl/build-info-action@v1.0.0

    - name: Create with alternate name.
      uses: nciocpl/build-info-action@v1.0.0
      with:
        output-name: alternate-file-name.json
```

