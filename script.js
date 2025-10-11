// Progressive enhancement: simple nav toggle for small screens (no frameworks)
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(! expanded));
        links.classList.toggle('open');
    });
}
const yearEl = document.getElementById('year');
if (yearEl) 
    yearEl.textContent = new Date().getFullYear();
    


// Auto-close details when focus leaves or on scroll
const detailsList = Array.from(document.querySelectorAll('#books-grid details'));
function closeAll(except) {
    for (const d of detailsList) {
        if (d !== except) 
            d.open = false;
        


    }
}
detailsList.forEach(d => {
    d.addEventListener('toggle', () => {
        if (d.open) 
            closeAll(d);
        


    });
    d.addEventListener('focusout', (e) => { // If focus moves outside this details, close it
        setTimeout(() => {
            if (!d.contains(document.activeElement)) 
                d.open = false;
            


        }, 0);
    });
});
window.addEventListener('scroll', () => closeAll());

// Client-side books loader (progressive enhancement)
(async () => {
    const grid = document.getElementById('books-grid');
        if (! grid) 
            return;
        
        // Purge any hardcoded fallback <article class="book"> inside #works container
        const worksContainer = document.querySelector('#works .container');
        if (worksContainer) {
            worksContainer.querySelectorAll('article.book').forEach(el => el.remove());
        }
        try {
            const remoteUrl = 'https://raw.githubusercontent.com/alexakeas/alexakeas.github.io/refs/heads/main/books.json';
            let books = null;                        
            try {
                const r = await fetch(remoteUrl, { cache: 'no-cache' });
                if (r.ok) books = await r.json();
            } catch {}
            if (!books) {
                try {
                    const r2 = await fetch('books.json', { cache: 'no-cache' });
                    if (r2.ok) books = await r2.json();
                } catch {}
            }

            const normYear = y => {
                if (!y) 
                    return null;
                
                const n = parseInt(String(y).replace(/[^0-9]/g, ''), 10);
                return Number.isFinite(n) ? n : null;
            };
            // Sort: by publicationDate desc first, then items without date
            const withDate = [],
                withoutDate = [];
            books.forEach((b, i) => (normYear(b.publicationDate) !== null ? withDate : withoutDate).push({
                ...b,
                __i: i
            }));
            withDate.sort((a, b) => normYear(b.publicationDate) - normYear(a.publicationDate));
            const ordered = withDate.concat(withoutDate);

            const toCard = b => `\n<article class="book" role="listitem">\n  <img class="cover" src="${
                b.cover
            }" alt="Couverture: ${
                b.title
            }" loading="lazy"/>\n  <div class="card-body">\n    <div class="meta"><span>${
                b.lang || '—'
            }</span><span>${
                b.publicationDate || '—'
            }</span></div>\n    <h3>${
                b.title
            }</h3>\n    <p class="quick">${
                b.blurb || ''
            }</p>\n  </div>\n  <details>\n    <summary><span class="chev">›</span><span>Plus de détails</span></summary>\n    <div class="details-body">\n      <p>${
                b.synopsis || ''
            }</p>\n      <div class="actions">\n        <a class="btn-text" href="${
                b.link || '#'
            }" target="_blank" rel="noopener">Voir sur Amazon</a>\n      </div>\n    </div>\n  </details>\n</article>`;

            grid.innerHTML = ordered.map(toCard).join('');
        } catch (err) { // keep server-rendered fallback
            console.warn('books.json load error', err);
        }
    }
)();
