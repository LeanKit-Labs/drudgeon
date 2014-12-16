## 0.1.#

### 0.1.3
Properly catch and handle ENOENTs resulting from commands not found.

### 0.1.2
Expose the failed step on the result via `failedStep` so that the caller can determine what the output of the broken step was.

### 0.1.1
Expose the command set reader as `readSet` off the returned function.