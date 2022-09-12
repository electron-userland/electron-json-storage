.PHONY: vendor

vendor-pull:
	./vendor/vendorpull/pull

vendor-pull-%:
	./vendor/vendorpull/pull $(subst vendor-pull-,,$@)
