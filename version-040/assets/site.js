const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
};

ready(() => {
    const searchToggle = document.querySelector("[data-search-toggle]");
    const searchPanel = document.querySelector("[data-search-panel]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (searchToggle && searchPanel) {
        searchToggle.addEventListener("click", () => {
            searchPanel.classList.toggle("is-open");
            const input = searchPanel.querySelector("input");
            if (searchPanel.classList.contains("is-open") && input) {
                input.focus();
            }
        });
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, itemIndex) => {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach((dot, itemIndex) => {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        };

        const startTimer = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => showSlide(current + 1), 6500);
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    const filterForm = document.querySelector("[data-filter-form]");
    if (filterForm) {
        const input = filterForm.querySelector("[data-filter-input]");
        const region = filterForm.querySelector("[data-filter-region]");
        const year = filterForm.querySelector("[data-filter-year]");
        const cards = Array.from(document.querySelectorAll("[data-filter-list] .movie-card"));
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        const applyFilter = () => {
            const keyword = (input ? input.value : "").trim().toLowerCase();
            const selectedRegion = region ? region.value : "";
            const selectedYear = year ? year.value : "";

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" ").toLowerCase();
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchRegion = !selectedRegion || haystack.includes(selectedRegion.toLowerCase());
                const matchYear = !selectedYear || card.dataset.year === selectedYear;
                card.classList.toggle("is-hidden-by-filter", !(matchKeyword && matchRegion && matchYear));
            });
        };

        [input, region, year].forEach((control) => {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        filterForm.addEventListener("reset", () => {
            window.setTimeout(applyFilter, 0);
        });

        applyFilter();
    }

    const player = document.querySelector("[data-player]");
    if (player) {
        const video = player.querySelector("video");
        const cover = player.querySelector(".player-cover");
        const playButton = player.querySelector(".play-now");
        let hlsInstance = null;

        const loadStream = async () => {
            if (!video || video.dataset.loaded === "true") {
                return;
            }

            const stream = video.dataset.stream;
            if (!stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.dataset.loaded = "true";
                return;
            }

            try {
                const module = await import("./hls.js");
                const Hls = module.H;
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    video.dataset.loaded = "true";
                    return;
                }
            } catch (error) {
                hlsInstance = null;
            }

            video.src = stream;
            video.dataset.loaded = "true";
        };

        const playVideo = async () => {
            await loadStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (video) {
                video.play().catch(() => {});
            }
        };

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        if (playButton) {
            playButton.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("play", () => {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });

            window.addEventListener("pagehide", () => {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    }
});
