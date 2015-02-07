## 0.1.#

### 0.1.5
Get tests passing on Windows. (path issues and odd bug that only appears on windows)

### 0.1.4
Chill out with the 'Error:' prefix all over the place in the event of an errored step.

### 0.1.3
Properly catch and handle ENOENTs resulting from commands not found.

### 0.1.2
Expose the failed step on the result via `failedStep` so that the caller can determine what the output of the broken step was.

### 0.1.1
Expose the command set reader as `readSet` off the returned function.
