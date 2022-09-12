.PHONY: build lint test clean
.DEFAULT_GOAL = build

# The current git commit hash
GIT_REVISION = $(shell git rev-parse HEAD)

HEADERS = include/assert.sh \
					include/masker.sh \
					include/patcher.sh \
					include/tmpdir.sh \
					include/dependencies.sh \
					include/vcs/git.sh \
					include/vcs/http.sh

COMMANDS = bootstrap \
					 pull

%: src/%.sh $(HEADERS)
	gpp -o $@ -I include \
		-U "" "" "(" "," ")" "(" ")" "\#" "\\" \
		-M "%" "\n" " " " " "\n" "(" ")" \
		$<
	chmod +x $@

build: $(COMMANDS)

lint: $(COMMANDS)
	shellcheck $^ test/*.sh .github/*.sh

test:
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/file-download.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/file-download-hash-mismatch.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/bootstrap-pristine.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/bootstrap-update.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/fail-non-git.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/git-root.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/idempotent-bootstrap.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/patch.sh
	VENDORPULL_REVISION=$(GIT_REVISION) ./test/mask.sh

clean:
	rm $(COMMANDS)
